export type GitHubConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

const STORAGE_KEY = "blank:github";

export const emptyGitHubConfig: GitHubConfig = {
  token: "",
  owner: "",
  repo: "",
  branch: "main",
};

export function loadGitHubConfig(): GitHubConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyGitHubConfig };
    const value = JSON.parse(raw) as Partial<GitHubConfig>;
    return {
      token: typeof value.token === "string" ? value.token : "",
      owner: typeof value.owner === "string" ? value.owner : "",
      repo: typeof value.repo === "string" ? value.repo : "",
      branch: typeof value.branch === "string" && value.branch ? value.branch : "main",
    };
  } catch {
    return { ...emptyGitHubConfig };
  }
}

export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function githubConfigured(config: GitHubConfig): boolean {
  return Boolean(config.token && config.owner && config.repo);
}

export function githubRepoLabel(config: GitHubConfig): string {
  return githubConfigured(config) ? `${config.owner}/${config.repo}` : "Connect GitHub";
}

async function request(config: GitHubConfig, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      body && typeof body.message === "string" ? body.message : `GitHub request failed (${response.status})`;
    throw new Error(message);
  }
  return body;
}

/**
 * Commits every file through the Contents API. Simple and dependency-free:
 * one commit per push, and existing files are updated in place.
 */
export async function pushToGitHub(
  config: GitHubConfig,
  files: Record<string, string>,
  message: string,
): Promise<{ committed: number; url: string }> {
  const paths = Object.keys(files).sort();
  let committed = 0;

  for (const path of paths) {
    const encoded = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    let sha: string | undefined;
    try {
      const existing = await request(config, `/repos/${config.owner}/${config.repo}/contents/${encoded}?ref=${encodeURIComponent(config.branch)}`);
      if (existing && typeof existing.sha === "string") sha = existing.sha;
    } catch (error) {
      // 404 simply means the file is new.
      if (!(error instanceof Error) || !/not found/i.test(error.message)) throw error;
    }

    await request(config, `/repos/${config.owner}/${config.repo}/contents/${encoded}`, {
      method: "PUT",
      body: JSON.stringify({
        message,
        branch: config.branch,
        content: typeof btoa === "function" ? btoa(unescape(encodeURIComponent(files[path]))) : "",
        ...(sha ? { sha } : {}),
      }),
    });

    committed++;
  }

  return {
    committed,
    url: `https://github.com/${config.owner}/${config.repo}/tree/${config.branch}`,
  };
}

type GitRef = { object?: { sha?: string } };
type GitCommit = { sha?: string; tree?: { sha?: string }; html_url?: string };
type GitBlob = { sha?: string };
type GitTree = { sha?: string };

/**
 * Commits many files as one commit through the Git Data API, so an AI change
 * set maps to exactly one commit instead of one commit per file.
 */
export async function commitFilesToGitHub(
  config: GitHubConfig,
  files: Record<string, string>,
  message: string,
): Promise<{ sha: string; url: string }> {
  const paths = Object.keys(files).sort();
  if (paths.length === 0) throw new Error("Nothing to commit.");

  const encodedBranch = config.branch
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const ref = (await request(config, `/repos/${config.owner}/${config.repo}/git/ref/heads/${encodedBranch}`)) as GitRef;
  const headSha = ref?.object?.sha;
  if (!headSha) throw new Error(`Branch “${config.branch}” was not found in this repository.`);

  const head = (await request(config, `/repos/${config.owner}/${config.repo}/git/commits/${headSha}`)) as GitCommit;
  const baseTree = head?.tree?.sha;
  if (!baseTree) throw new Error("The branch head has no tree to build on.");

  const blobs = await Promise.all(
    paths.map(async (path) => {
      const blob = (await request(config, `/repos/${config.owner}/${config.repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: files[path], encoding: "utf-8" }),
      })) as GitBlob;
      if (!blob?.sha) throw new Error(`GitHub did not accept “${path}”.`);
      return { path, sha: blob.sha };
    }),
  );

  const tree = (await request(config, `/repos/${config.owner}/${config.repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseTree,
      tree: blobs.map((blob) => ({ path: blob.path, mode: "100644", type: "blob", sha: blob.sha })),
    }),
  })) as GitTree;
  if (!tree?.sha) throw new Error("GitHub did not accept the new tree.");

  const commit = (await request(config, `/repos/${config.owner}/${config.repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }),
  })) as GitCommit;
  if (!commit?.sha) throw new Error("GitHub did not create the commit.");

  await request(config, `/repos/${config.owner}/${config.repo}/git/refs/heads/${encodedBranch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return {
    sha: commit.sha,
    url: commit.html_url ?? `https://github.com/${config.owner}/${config.repo}/commit/${commit.sha}`,
  };
}
