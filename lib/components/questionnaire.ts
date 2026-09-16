import type { ComponentSpec } from "@/lib/component-model";

export const defaultQuestionnaireTSX = `import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./styles.css";

export type QuestionnaireProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;

    children?: ReactNode;
  };

const options = ["Yes", "No", "Not sure"];

export const Questionnaire = forwardRef<
  HTMLDivElement,
  QuestionnaireProps
>(function Questionnaire(
  {
    children = "How are you?",
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={[
        "blank-questionnaire",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="blank-questionnaire__question">
        {children}
      </span>

      <div className="blank-questionnaire__options">
        {options.map((option, index) => (
          <label
            key={option}
            className="blank-questionnaire__option"
          >
            <input
              type="radio"
              name="blank-questionnaire"
              defaultChecked={index === 0}
              disabled={disabled}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
});
`;

const questionnaireSubCSS = `.blank-questionnaire {
  display: grid;
  gap: 8px;
}
.blank-questionnaire__question {
  display: block;
}
.blank-questionnaire__options {
  display: grid;
  gap: 6px;
}
.blank-questionnaire__option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}`;

export const QUESTIONNAIRE_SPEC: ComponentSpec = {
  id: "questionnaire",
  name: "Questionnaire",
  fileName: "Questionnaire.tsx",
  exportName: "Questionnaire",
  className: "blank-questionnaire",
  vanillaTSX: defaultQuestionnaireTSX,
  contentProp: "children",
  contentLabel: "Question",
  defaultContent: "How are you?",
  subCSS: questionnaireSubCSS,
  supportedStates: ["default"],
};
