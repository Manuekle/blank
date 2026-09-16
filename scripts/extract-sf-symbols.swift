// Extracts the SF Symbols listed in components/icons/sf-symbols.json as SVG path data
// and writes components/icons/sf-symbols.generated.ts.
//
// Symbols are rendered with SwiftUI's public ImageRenderer into a PDF context and the
// vector operators are read back with CGPDFScanner. Layered symbols knock out overlaps
// with luminosity soft masks; those are applied with CGPath boolean operations, so every
// symbol becomes a single path. Each path is checked against a raster render of the same
// symbol before anything is written.
//
// Requires macOS 14+. Run with `npm run icons`.

import AppKit
import SwiftUI

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let manifestURL = root.appendingPathComponent("components/icons/sf-symbols.json")
let outputURL = root.appendingPathComponent("components/icons/sf-symbols.generated.ts")

/// Point size symbols are rendered at; output coordinates use this scale.
let pointSize: CGFloat = 100
/// Square each symbol is centered in. 120 units keeps SF Symbols at the optical size of 24px icon grids.
let box: CGFloat = 120
/// Maximum allowed difference between the extracted path and the rendered symbol, in percent of ink.
let maxMismatch = 1.0

let weights: [String: Font.Weight] = [
    "ultralight": .ultraLight, "thin": .thin, "light": .light, "regular": .regular, "medium": .medium,
    "semibold": .semibold, "bold": .bold, "heavy": .heavy, "black": .black,
]

struct Manifest: Decodable {
    let weight: String
    let symbols: [String]
}

struct Failure: Error, CustomStringConvertible {
    let description: String
    init(_ description: String) { self.description = description }
}

// MARK: - PDF vector reading

struct Fill {
    var path: CGPath
    var luminance: CGFloat
}

enum Mask {
    case erase(CGPath)
    case keep(CGPath)

    func apply(to path: CGPath) -> CGPath {
        switch self {
        case .erase(let area): return path.subtracting(area)
        case .keep(let area): return path.intersection(area)
        }
    }
}

struct GraphicsState {
    var ctm: CGAffineTransform
    var mask: Mask?
    var luminance: CGFloat = 0
    var colorComponents = 1
}

final class Scan {
    let table: CGPDFOperatorTableRef
    var state: GraphicsState
    var saved: [GraphicsState] = []
    var path = CGMutablePath()
    var fills: [Fill] = []

    init(table: CGPDFOperatorTableRef, ctm: CGAffineTransform) {
        self.table = table
        state = GraphicsState(ctm: ctm)
    }

    func run(_ content: CGPDFContentStreamRef) -> [Fill] {
        let scanner = CGPDFScannerCreate(content, table, Unmanaged.passUnretained(self).toOpaque())
        CGPDFScannerScan(scanner)
        CGPDFScannerRelease(scanner)
        return fills
    }

    func point(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
        CGPoint(x: x, y: y).applying(state.ctm)
    }

    func setColor(_ components: [CGFloat]) {
        state.colorComponents = components.count
        state.luminance = luminance(components)
    }

    func paint(evenOdd: Bool) {
        let shape: CGPath = evenOdd ? path.normalized(using: .evenOdd) : path
        path = CGMutablePath()
        fills.append(Fill(path: state.mask?.apply(to: shape) ?? shape, luminance: state.luminance))
    }

    func setGraphicsState(_ scanner: CGPDFScannerRef) {
        let content = CGPDFScannerGetContentStream(scanner)
        var dictionary: CGPDFDictionaryRef?
        var smask: CGPDFObjectRef?
        guard let name = popName(scanner),
              let object = CGPDFContentStreamGetResource(content, "ExtGState", name),
              CGPDFObjectGetValue(object, .dictionary, &dictionary), let graphicsState = dictionary,
              CGPDFDictionaryGetObject(graphicsState, "SMask", &smask), let maskObject = smask else { return }

        var maskDictionary: CGPDFDictionaryRef?
        var group: CGPDFStreamRef?
        guard CGPDFObjectGetValue(maskObject, .dictionary, &maskDictionary), let mask = maskDictionary,
              CGPDFDictionaryGetStream(mask, "G", &group), let form = group else {
            state.mask = nil // /SMask /None
            return
        }

        var subtype: UnsafePointer<CChar>?
        let alpha = CGPDFDictionaryGetName(mask, "S", &subtype) && subtype.map { String(cString: $0) } == "Alpha"
        var backdrop: CGPDFArrayRef?
        let backdropLuminance = CGPDFDictionaryGetArray(mask, "BC", &backdrop) && backdrop != nil
            ? luminance(numbers(in: backdrop!)) : 0
        let fills = Scan.form(form, parent: content, ctm: state.ctm, table: table)

        if !alpha && backdropLuminance >= 0.5 {
            // White backdrop: the group is opaque except where it paints dark shapes.
            var erased: CGPath = CGMutablePath()
            for fill in fills { erased = fill.luminance < 0.5 ? erased.union(fill.path) : erased.subtracting(fill.path) }
            state.mask = .erase(erased)
        } else {
            var kept: CGPath = CGMutablePath()
            for fill in fills { kept = alpha || fill.luminance >= 0.5 ? kept.union(fill.path) : kept.subtracting(fill.path) }
            state.mask = .keep(kept)
        }
    }

    func drawXObject(_ scanner: CGPDFScannerRef) {
        let content = CGPDFScannerGetContentStream(scanner)
        var stream: CGPDFStreamRef?
        guard let name = popName(scanner),
              let object = CGPDFContentStreamGetResource(content, "XObject", name),
              CGPDFObjectGetValue(object, .stream, &stream), let form = stream else { return }
        for fill in Scan.form(form, parent: content, ctm: state.ctm, table: table) {
            fills.append(Fill(path: state.mask?.apply(to: fill.path) ?? fill.path, luminance: fill.luminance))
        }
    }

    static func form(_ form: CGPDFStreamRef, parent: CGPDFContentStreamRef, ctm: CGAffineTransform,
                     table: CGPDFOperatorTableRef) -> [Fill] {
        var subtype: UnsafePointer<CChar>?
        guard let dictionary = CGPDFStreamGetDictionary(form),
              CGPDFDictionaryGetName(dictionary, "Subtype", &subtype), let kind = subtype,
              String(cString: kind) == "Form" else { return [] }
        var matrix = CGAffineTransform.identity
        var array: CGPDFArrayRef?
        if CGPDFDictionaryGetArray(dictionary, "Matrix", &array), let values = array {
            let m = numbers(in: values)
            if m.count == 6 { matrix = CGAffineTransform(a: m[0], b: m[1], c: m[2], d: m[3], tx: m[4], ty: m[5]) }
        }
        var resources: CGPDFDictionaryRef?
        CGPDFDictionaryGetDictionary(dictionary, "Resources", &resources)
        let content = CGPDFContentStreamCreateWithStream(form, resources ?? dictionary, parent)
        defer { CGPDFContentStreamRelease(content) }
        return Scan(table: table, ctm: matrix.concatenating(ctm)).run(content)
    }
}

func scan(_ info: UnsafeMutableRawPointer?) -> Scan {
    Unmanaged<Scan>.fromOpaque(info!).takeUnretainedValue()
}

func popName(_ scanner: CGPDFScannerRef) -> UnsafePointer<CChar>? {
    var name: UnsafePointer<CChar>?
    return CGPDFScannerPopName(scanner, &name) ? name : nil
}

/// Pops `count` numeric operands, returned in source order.
func numbers(_ scanner: CGPDFScannerRef, _ count: Int) -> [CGFloat] {
    var values = [CGFloat](repeating: 0, count: count)
    for index in stride(from: count - 1, through: 0, by: -1) {
        var value: CGPDFReal = 0
        CGPDFScannerPopNumber(scanner, &value)
        values[index] = CGFloat(value)
    }
    return values
}

/// Number of color components in the color space named by a `cs` operand.
func colorSpaceComponents(_ scanner: CGPDFScannerRef) -> Int {
    guard let name = popName(scanner) else { return 1 }
    switch String(cString: name) {
    case "DeviceGray": return 1
    case "DeviceRGB": return 3
    case "DeviceCMYK": return 4
    default: break
    }
    var array: CGPDFArrayRef?
    var stream: CGPDFStreamRef?
    var count: CGPDFInteger = 1
    guard let object = CGPDFContentStreamGetResource(CGPDFScannerGetContentStream(scanner), "ColorSpace", name),
          CGPDFObjectGetValue(object, .array, &array), let space = array,
          CGPDFArrayGetStream(space, 1, &stream), let profile = stream,
          let dictionary = CGPDFStreamGetDictionary(profile),
          CGPDFDictionaryGetInteger(dictionary, "N", &count) else { return 1 }
    return count
}

func numbers(in array: CGPDFArrayRef) -> [CGFloat] {
    (0..<CGPDFArrayGetCount(array)).map { index in
        var value: CGPDFReal = 0
        CGPDFArrayGetNumber(array, index, &value)
        return CGFloat(value)
    }
}

func luminance(_ components: [CGFloat]) -> CGFloat {
    switch components.count {
    case 1: return components[0]
    case 3: return 0.2126 * components[0] + 0.7152 * components[1] + 0.0722 * components[2]
    case 4: return (1 - components[3]) * (1 - (components[0] + components[1] + components[2]) / 3)
    default: return 0
    }
}

func makeOperatorTable() -> CGPDFOperatorTableRef {
    let table = CGPDFOperatorTableCreate()!
    CGPDFOperatorTableSetCallback(table, "q") { _, info in let s = scan(info); s.saved.append(s.state) }
    CGPDFOperatorTableSetCallback(table, "Q") { _, info in let s = scan(info); if let state = s.saved.popLast() { s.state = state } }
    CGPDFOperatorTableSetCallback(table, "cm") { scanner, info in
        let s = scan(info), v = numbers(scanner, 6)
        s.state.ctm = CGAffineTransform(a: v[0], b: v[1], c: v[2], d: v[3], tx: v[4], ty: v[5]).concatenating(s.state.ctm)
    }
    CGPDFOperatorTableSetCallback(table, "m") { scanner, info in
        let s = scan(info), v = numbers(scanner, 2)
        s.path.move(to: s.point(v[0], v[1]))
    }
    CGPDFOperatorTableSetCallback(table, "l") { scanner, info in
        let s = scan(info), v = numbers(scanner, 2)
        s.path.addLine(to: s.point(v[0], v[1]))
    }
    CGPDFOperatorTableSetCallback(table, "c") { scanner, info in
        let s = scan(info), v = numbers(scanner, 6)
        s.path.addCurve(to: s.point(v[4], v[5]), control1: s.point(v[0], v[1]), control2: s.point(v[2], v[3]))
    }
    CGPDFOperatorTableSetCallback(table, "v") { scanner, info in
        let s = scan(info), v = numbers(scanner, 4)
        s.path.addCurve(to: s.point(v[2], v[3]), control1: s.path.currentPoint, control2: s.point(v[0], v[1]))
    }
    CGPDFOperatorTableSetCallback(table, "y") { scanner, info in
        let s = scan(info), v = numbers(scanner, 4), end = s.point(v[2], v[3])
        s.path.addCurve(to: end, control1: s.point(v[0], v[1]), control2: end)
    }
    CGPDFOperatorTableSetCallback(table, "re") { scanner, info in
        let s = scan(info), v = numbers(scanner, 4)
        s.path.addRect(CGRect(x: v[0], y: v[1], width: v[2], height: v[3]), transform: s.state.ctm)
    }
    CGPDFOperatorTableSetCallback(table, "h") { _, info in scan(info).path.closeSubpath() }
    CGPDFOperatorTableSetCallback(table, "n") { _, info in scan(info).path = CGMutablePath() }
    CGPDFOperatorTableSetCallback(table, "f") { _, info in scan(info).paint(evenOdd: false) }
    CGPDFOperatorTableSetCallback(table, "F") { _, info in scan(info).paint(evenOdd: false) }
    CGPDFOperatorTableSetCallback(table, "f*") { _, info in scan(info).paint(evenOdd: true) }
    CGPDFOperatorTableSetCallback(table, "cs") { scanner, info in
        let s = scan(info)
        s.state.colorComponents = colorSpaceComponents(scanner)
        s.state.luminance = 0
    }
    CGPDFOperatorTableSetCallback(table, "g") { scanner, info in scan(info).setColor(numbers(scanner, 1)) }
    CGPDFOperatorTableSetCallback(table, "rg") { scanner, info in scan(info).setColor(numbers(scanner, 3)) }
    CGPDFOperatorTableSetCallback(table, "k") { scanner, info in scan(info).setColor(numbers(scanner, 4)) }
    CGPDFOperatorTableSetCallback(table, "sc") { scanner, info in let s = scan(info); s.setColor(numbers(scanner, s.state.colorComponents)) }
    CGPDFOperatorTableSetCallback(table, "scn") { scanner, info in let s = scan(info); s.setColor(numbers(scanner, s.state.colorComponents)) }
    CGPDFOperatorTableSetCallback(table, "gs") { scanner, info in scan(info).setGraphicsState(scanner) }
    CGPDFOperatorTableSetCallback(table, "Do") { scanner, info in scan(info).drawXObject(scanner) }
    return table
}

// MARK: - Rendering

func pdfData(_ size: CGSize, _ draw: (CGContext) -> Void) -> Data {
    let data = NSMutableData()
    var mediaBox = CGRect(origin: .zero, size: size)
    let context = CGContext(consumer: CGDataConsumer(data: data as CFMutableData)!, mediaBox: &mediaBox, nil)!
    context.beginPDFPage(nil)
    draw(context)
    context.endPDFPage()
    context.closePDF()
    return data as Data
}

/// Grayscale pixels on a white background.
func bitmap(_ size: CGSize, _ draw: (CGContext) -> Void) -> [UInt8] {
    let width = Int(size.width.rounded(.up)), height = Int(size.height.rounded(.up))
    let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width,
                            space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.none.rawValue)!
    context.setFillColor(gray: 1, alpha: 1)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.setFillColor(gray: 0, alpha: 1)
    draw(context)
    return Array(UnsafeBufferPointer(start: context.data!.assumingMemoryBound(to: UInt8.self), count: width * height))
}

func mismatch(_ reference: [UInt8], _ candidate: [UInt8]) -> Double {
    var difference = 0, ink = 0
    for index in reference.indices {
        difference += abs(Int(reference[index]) - Int(candidate[index]))
        ink += 255 - Int(reference[index])
    }
    return ink == 0 ? 100 : Double(difference) / Double(ink) * 100
}

func vectorize(_ pdf: Data, table: CGPDFOperatorTableRef) -> CGPath? {
    guard let provider = CGDataProvider(data: pdf as CFData),
          let page = CGPDFDocument(provider)?.page(at: 1) else { return nil }
    let content = CGPDFContentStreamCreateWithPage(page)
    defer { CGPDFContentStreamRelease(content) }
    var shape: CGPath = CGMutablePath()
    for fill in Scan(table: table, ctm: .identity).run(content) { shape = shape.union(fill.path) }
    return shape
}

// MARK: - Output

func number(_ value: CGFloat) -> String {
    var text = String(format: "%.1f", value)
    if text.hasSuffix(".0") { text.removeLast(2) }
    return text == "-0" ? "0" : text
}

/// Centers the symbol in a `box` square (grown to fit wider or taller symbols) with SVG's y-down axis.
func entry(_ name: String, _ shape: CGPath) -> String {
    let bounds = shape.boundingBoxOfPath
    let width = max(box, bounds.width.rounded(.up)), height = max(box, bounds.height.rounded(.up))
    let dx = width / 2 - bounds.midX, top = height / 2 + bounds.midY
    func point(_ p: CGPoint) -> String { "\(number(p.x + dx)) \(number(top - p.y))" }
    var d = ""
    shape.applyWithBlock { element in
        let points = element.pointee.points
        switch element.pointee.type {
        case .moveToPoint: d += "M" + point(points[0])
        case .addLineToPoint: d += "L" + point(points[0])
        case .addQuadCurveToPoint: d += "Q" + point(points[0]) + " " + point(points[1])
        case .addCurveToPoint: d += "C" + point(points[0]) + " " + point(points[1]) + " " + point(points[2])
        case .closeSubpath: d += "Z"
        @unknown default: break
        }
    }
    return "  \"\(name)\": { width: \(number(width)), height: \(number(height)), d: \"\(d)\" },"
}

@MainActor
func run() throws {
    let manifest = try JSONDecoder().decode(Manifest.self, from: Data(contentsOf: manifestURL))
    guard let weight = weights[manifest.weight] else {
        throw Failure("unknown weight \"\(manifest.weight)\", use one of: \(weights.keys.sorted().joined(separator: ", "))")
    }
    let table = makeOperatorTable()
    var entries: [String] = []
    var failures: [String] = []

    for name in Set(manifest.symbols).sorted() {
        guard name.range(of: "^[a-z0-9]+(\\.[a-z0-9]+)*$", options: .regularExpression) != nil,
              NSImage(systemSymbolName: name, accessibilityDescription: nil) != nil else {
            failures.append("\(name): no such symbol on this version of macOS")
            continue
        }
        var size = CGSize.zero, pdf = Data(), reference: [UInt8] = []
        ImageRenderer(content: Image(systemName: name)
            .font(.system(size: pointSize, weight: weight))
            .imageScale(.medium)
            .symbolRenderingMode(.monochrome)
            .foregroundStyle(Color.black)
        ).render { renderedSize, draw in
            size = renderedSize
            pdf = pdfData(renderedSize, draw)
            reference = bitmap(renderedSize, draw)
        }
        guard let shape = vectorize(pdf, table: table), !shape.isEmpty else {
            failures.append("\(name): no vector outline in the rendered symbol")
            continue
        }
        let difference = mismatch(reference, bitmap(size) { context in
            context.addPath(shape)
            context.fillPath()
        })
        guard difference <= maxMismatch else {
            failures.append("\(name): extracted outline differs from the rendered symbol by \(String(format: "%.1f", difference))%")
            continue
        }
        entries.append(entry(name, shape))
    }

    guard failures.isEmpty else { throw Failure(failures.joined(separator: "\n")) }

    let source = """
    // Generated by scripts/extract-sf-symbols.swift. Do not edit.
    // SF Symbols (\(manifest.weight)) rendered on macOS \(ProcessInfo.processInfo.operatingSystemVersionString).
    // To add a symbol, list its name in components/icons/sf-symbols.json and run `npm run icons`.

    /** Square every symbol is centered in, in viewBox units. Wider or taller symbols extend it. */
    export const SF_SYMBOL_BOX = \(number(box));

    export const sfSymbols = {
    \(entries.joined(separator: "\n"))
    } as const;

    export type SFSymbolName = keyof typeof sfSymbols;

    """
    try source.write(to: outputURL, atomically: true, encoding: .utf8)
    print("Wrote \(entries.count) symbols to components/icons/sf-symbols.generated.ts")
}

MainActor.assumeIsolated {
    do {
        try run()
    } catch {
        FileHandle.standardError.write(Data("extract-sf-symbols: \(error)\n".utf8))
        exit(1)
    }
}
