import os
import subprocess
import time
from typing import Dict


SUPPORTED_LANGS = {"python", "c", "cpp", "java"}


def make_run_folder(session_id:str,base_dir: str = "runs") -> str:
    folder = os.path.join(base_dir, session_id)
    os.makedirs(folder, exist_ok=True)
    return folder


def get_filename(language: str) -> str:
    if language == "python":
        filename = "main.py"
    elif language == "c":
        filename = "main.c"
    elif language == "cpp":
        filename = "main.cpp"
    elif language == "java":
        filename = "Main.java"
    else:
        raise ValueError("Unsupported language")

    return filename


def get_commands(language: str, filename: str):
    compile_cmd = None
    run_cmd = None

    if language == "python":
        run_cmd = ["python3", filename]

    elif language == "c":
        compile_cmd = ["gcc", filename, "-o", "main"]
        run_cmd = ["./main"]

    elif language == "cpp":
        compile_cmd = ["g++", filename, "-o", "main"]
        run_cmd = ["./main"]

    elif language == "java":
        compile_cmd = ["javac", filename]
        run_cmd = ["java", "Main"]

    return compile_cmd, run_cmd


def compile_and_run(
    session_id: str,
    language: str,
    code: str,
    stdin: str = "",
    base_dir: str = "runs",
    compile_timeout: int = 5,
    run_timeout: int = 3,
) -> Dict:
    language = language.lower().strip()

    if language not in SUPPORTED_LANGS:
        return {
            "status": "error",
            "stdout": "",
            "stderr": f"Unsupported language: {language}",
        }

    folder = make_run_folder(session_id,base_dir=base_dir)

    try:
        filename =get_filename(language)
        file_path= os.path.join(folder,filename)

        with open(file_path, "w",encoding="utf-8") as f:
            f.write(code)
    except Exception as e:
        return {
            "status": "error",
            "stdout": "",
            "stderr": f"Failed to write code file: {e}",
            "sessionId": session_id
        }

    compile_cmd, run_cmd = get_commands(language, filename)

    # Compile
    if compile_cmd:
        try:
            comp = subprocess.run(
                compile_cmd,
                cwd=folder,
                capture_output=True,
                text=True,
                timeout=compile_timeout,
            )

            if comp.returncode != 0:
                return {
                    "status": "compile_error",
                    "stdout": comp.stdout or "",
                    "stderr": comp.stderr or "",
                    "sessionId":session_id
                }

        except subprocess.TimeoutExpired:
            return {
                "status": "compile_timeout",
                "stdout": "",
                "stderr": "Compilation timed out",
                "sessionId":session_id
                
            }

    # Run
    try:
        start = time.time()

        run = subprocess.run(
            run_cmd,
            cwd=folder,
            input=stdin,
            capture_output=True,
            text=True,
            timeout=run_timeout,
        )

        end = time.time()

        return {
            "status": "success" if run.returncode == 0 else "runtime_error",
            "stdout": run.stdout or "",
            "stderr": run.stderr or "",
            "exit_code": run.returncode,
            "time_ms": int((end - start) * 1000),
            "sessionId":session_id
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "runtime_timeout",
            "stdout": "",
            "stderr": "Program timed out",
            "sessionId":session_id
        }
