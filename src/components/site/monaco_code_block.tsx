import { useEffect, useRef, useState } from "react";

const MONACO_VERSION = "0.52.2";
const MONACO_LOADER_URL = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs/loader.js`;

type MonacoEditorInstance = { dispose: () => void };
type MonacoApi = {
	editor: {
		create: (
			element: HTMLElement,
			options: {
				value: string;
				language: string;
				theme: string;
				readOnly: boolean;
				minimap: { enabled: boolean };
				lineNumbers: "on";
				scrollBeyondLastLine: boolean;
				wordWrap: "off";
				padding: { top: number; bottom: number };
			},
		) => MonacoEditorInstance;
	};
};
type MonacoLoader = {
	config: (options: { paths: { vs: string } }) => void;
	init: () => void;
};
type MonacoRequire = ((modules: string[], callback: () => void) => void) & {
	config?: MonacoLoader["config"];
};

declare global {
	interface Window {
		monaco?: MonacoApi;
		require?: MonacoRequire;
	}
}

let monacoPromise: Promise<MonacoApi> | undefined;

const LANGUAGE_ALIASES: Record<string, string> = {
	sh: "shell",
	shell: "shell",
	ts: "typescript",
	tsx: "typescript",
	js: "javascript",
	jsx: "javascript",
	md: "markdown",
	yml: "yaml",
	py: "python",
	cs: "csharp",
	"c++": "cpp",
	html: "html",
	json: "json",
};

function normalizeLanguage(language: string | undefined): string {
	const normalized = language?.trim().toLowerCase() ?? "";
	return LANGUAGE_ALIASES[normalized] ?? (normalized || "plaintext");
}

function loadMonaco(): Promise<MonacoApi> {
	if (window.monaco) return Promise.resolve(window.monaco);
	if (monacoPromise) return monacoPromise;

	monacoPromise = new Promise((resolve, reject) => {
		const initialize = () => {
			const loader = window.require;
			if (!loader) {
				reject(new Error("Monaco loader did not initialize"));
				return;
			}
			loader.config?.({
				paths: {
					vs: `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`,
				},
			});
			loader(["vs/editor/editor.main"], () => {
				if (window.monaco) resolve(window.monaco);
				else reject(new Error("Monaco editor did not initialize"));
			});
		};

		const existingScript = document.querySelector<HTMLScriptElement>(
			`script[src="${MONACO_LOADER_URL}"]`,
		);
		if (existingScript) {
			if (existingScript.dataset.loaded === "true") initialize();
			else
				existingScript.addEventListener("load", initialize, {
					once: true,
				});
			return;
		}

		const script = document.createElement("script");
		script.src = MONACO_LOADER_URL;
		script.onload = () => {
			script.dataset.loaded = "true";
			initialize();
		};
		script.onerror = () => reject(new Error("Monaco loader failed"));
		document.head.appendChild(script);
	});

	return monacoPromise;
}

function StaticCodeBlock({
	code,
	language,
	classLanguage,
}: {
	code: string;
	language: string;
	classLanguage: string;
}) {
	return (
		<div data-code-language={language}>
			<pre>
				<code className={`language-${classLanguage}`}>{code}</code>
			</pre>
		</div>
	);
}

function codeHeight(code: string): number {
	const lineCount = code.split("\n").length;
	return Math.min(Math.max(lineCount * 22 + 40, 100), 560);
}

/**
 * 渲染只读代码块：服务端保持静态 HTML，浏览器端再增强为 Monaco。
 */
export function MonacoCodeBlock({
	code,
	language,
}: {
	code: string;
	language?: string;
}) {
	const [isClient, setIsClient] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [copyLabel, setCopyLabel] = useState("Copy");
	const mountRef = useRef<HTMLDivElement>(null);
	const editorRef = useRef<MonacoEditorInstance | null>(null);
	const normalizedLanguage = normalizeLanguage(language);
	const classLanguage = language?.trim().toLowerCase() || normalizedLanguage;

	useEffect(() => {
		setIsClient(true);
		let disposed = false;
		loadMonaco()
			.then((monaco) => {
				if (disposed || !mountRef.current) return;
				editorRef.current = monaco.editor.create(mountRef.current, {
					value: code,
					language: normalizedLanguage,
					theme: "vs-dark",
					readOnly: true,
					minimap: { enabled: false },
					lineNumbers: "on",
					scrollBeyondLastLine: false,
					wordWrap: "off",
					padding: { top: 16, bottom: 16 },
				});
				setIsReady(true);
			})
			.catch(() => undefined);

		return () => {
			disposed = true;
			editorRef.current?.dispose();
			editorRef.current = null;
		};
	}, [code, normalizedLanguage]);

	if (!isClient || !isReady) {
		return (
			<StaticCodeBlock
				code={code}
				language={normalizedLanguage}
				classLanguage={classLanguage}
			/>
		);
	}

	return (
		<div
			className="monaco-code-block"
			data-code-language={normalizedLanguage}
		>
			<div className="monaco-code-block__toolbar">
				<span>{normalizedLanguage}</span>
				<button
					type="button"
					aria-label="Copy code"
					onClick={() => {
						navigator.clipboard?.writeText(code).then(() => {
							setCopyLabel("Copied");
							setTimeout(() => setCopyLabel("Copy"), 1500);
						});
					}}
				>
					{copyLabel}
				</button>
			</div>
			<div
				ref={mountRef}
				className="monaco-code-block__editor"
				style={{ height: `${codeHeight(code)}px` }}
			/>
		</div>
	);
}
