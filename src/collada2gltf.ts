/**
 * Collada to glTF Converter
 * Simplified entry point for converting Collada files to glTF 2.0
 */

import { ColladaLoader } from './loader';
import { GLTFExporter } from './gltf/exporter';
import { GLTF2 } from './gltf/types';
import { LogCallback, LogLevel, LogFilter } from './log';
import { Document as ColladaDocument } from './loader/document';

/**
 * Options for Collada to glTF conversion
 */
export interface ConversionOptions {
    /** Log level for conversion messages */
    logLevel?: LogLevel;
    /** Custom log callback */
    logCallback?: (message: string, level: LogLevel) => void;
}

/**
 * Convert Collada XML string to glTF 2.0 JSON
 * @param colladaXml Collada XML string or DOM Document
 * @param options Conversion options
 * @returns glTF 2.0 JSON object
 */
export function convertColladaToGLTF(
    colladaXml: string | XMLDocument,
    options: ConversionOptions = {}
): GLTF2.IGLTF {
    // Setup logging
    const logCallback = new LogCallback();
    logCallback.onmessage = options.logCallback || ((message: string, level: LogLevel) => {
        if (level >= LogLevel.Warning) {
            console.log(message);
        }
    });
    const logLevel = options.logLevel !== undefined ? options.logLevel : LogLevel.Warning;
    const log = new LogFilter(logCallback, logLevel);

    // Parse Collada XML
    const loader = new ColladaLoader();
    loader.log = log;

    let colladaDoc: ColladaDocument | undefined;
    if (typeof colladaXml === 'string') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(colladaXml, "text/xml");
        colladaDoc = loader.loadFromXML("collada", xmlDoc);
    } else {
        colladaDoc = loader.loadFromXML("collada", colladaXml);
    }

    if (!colladaDoc) {
        throw new Error("Failed to parse Collada document");
    }

    // Export to glTF
    const exporter = new GLTFExporter();
    const gltf = exporter.export(colladaDoc);

    return gltf;
}

/**
 * Convert Collada XML string to glTF JSON string
 * @param colladaXml Collada XML string
 * @param options Conversion options
 * @param pretty Whether to pretty-print the JSON (default: true)
 * @returns glTF JSON string
 */
export function convertColladaToGLTFString(
    colladaXml: string | XMLDocument,
    options: ConversionOptions = {},
    pretty: boolean = true
): string {
    const gltf = convertColladaToGLTF(colladaXml, options);
    return JSON.stringify(gltf, null, pretty ? 2 : 0);
}

/**
 * Export for backward compatibility
 */
export { GLTFExporter } from './gltf/exporter';
export { GLTF2 } from './gltf/types';
export { ColladaLoader } from './loader';
export { LogLevel, LogCallback, LogFilter } from './log';
