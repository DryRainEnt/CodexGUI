#!/usr/bin/env python
"""
CodexGUI Test Runner
A comprehensive test script that checks functionality of each sprint
"""
import os
import sys
import subprocess
import argparse
import time
import http.client
import json
from pathlib import Path

# Define project paths
PROJECT_ROOT = Path(__file__).parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
BACKEND_DIR = PROJECT_ROOT / "backend"
TESTS_DIR = PROJECT_ROOT / "tests"

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 50)
    print(f"  {title}")
    print("=" * 50 + "\n")

def run_command(command, cwd=None, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            check=check,
            capture_output=True,
            text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        if check:
            sys.exit(1)
        return e

def check_requirements():
    """Check if all requirements are installed"""
    print_header("Checking Requirements")
    
    # Check Python version
    python_version = run_command("python --version")
    print(f"Python version: {python_version.stdout.strip()}")
    
    # Check Node.js version
    node_version = run_command("node --version")
    print(f"Node.js version: {node_version.stdout.strip()}")
    
    # Check npm version
    npm_version = run_command("npm --version")
    print(f"npm version: {npm_version.stdout.strip()}")
    
    # Check Git version
    git_version = run_command("git --version")
    print(f"Git version: {git_version.stdout.strip()}")
    
    print("\nAll requirements checked.")

def run_frontend_tests():
    """Run frontend tests"""
    print_header("Running Frontend Tests")
    
    # Install dependencies if needed
    if not (FRONTEND_DIR / "node_modules").exists():
        print("Installing frontend dependencies...")
        run_command("npm install", cwd=FRONTEND_DIR)
    
    # Run tests
    print("Running frontend tests...")
    result = run_command("npm test", cwd=FRONTEND_DIR, check=False)
    
    if result.returncode != 0:
        print("Frontend tests failed.")
        return False
    
    print("Frontend tests passed.")
    return True

def run_backend_tests():
    """Run backend tests"""
    print_header("Running Backend Tests")
    
    # Install test dependencies if needed
    print("Installing backend test dependencies...")
    run_command("pip install pytest pytest-asyncio httpx", check=False)
    
    # Run tests
    print("Running backend tests...")
    result = run_command("python -m pytest -v", cwd=BACKEND_DIR, check=False)
    
    if result.returncode != 0:
        print("Backend tests failed.")
        return False
    
    print("Backend tests passed.")
    return True

def start_backend_server():
    """Start the backend server for integration tests"""
    print("Starting backend server...")
    server_process = subprocess.Popen(
        ["python", "-m", "app.main"], 
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    time.sleep(2)
    
    # Check if server is running
    try:
        conn = http.client.HTTPConnection("localhost", 8000)
        conn.request("GET", "/api/health")
        response = conn.getresponse()
        if response.status != 200:
            print(f"Server not responding correctly: {response.status}")
            server_process.terminate()
            return None
    except Exception as e:
        print(f"Failed to connect to server: {e}")
        server_process.terminate()
        return None
    
    print("Backend server started successfully.")
    return server_process

def stop_backend_server(server_process):
    """Stop the backend server"""
    if server_process:
        print("Stopping backend server...")
        server_process.terminate()
        time.sleep(1)
        print("Backend server stopped.")

def test_sprint0():
    """Test Sprint 0 - Project Setup"""
    print_header("Testing Sprint 0 - Project Setup")
    
    # Check essential directories and files
    print("Checking project structure...")
    required_paths = [
        FRONTEND_DIR,
        BACKEND_DIR,
        FRONTEND_DIR / "package.json",
        FRONTEND_DIR / "tsconfig.json",
        FRONTEND_DIR / "vite.config.ts",
        BACKEND_DIR / "requirements.txt",
        BACKEND_DIR / "app" / "main.py"
    ]
    
    for path in required_paths:
        if not path.exists():
            print(f"FAIL: {path} not found")
            return False
        print(f"PASS: {path} exists")
    
    # Check if frontend builds
    print("\nChecking if frontend builds...")
    build_result = run_command("npm run build", cwd=FRONTEND_DIR, check=False)
    
    if build_result.returncode != 0:
        print("FAIL: Frontend build failed")
        return False
    
    if not (FRONTEND_DIR / "dist").exists():
        print("FAIL: Frontend build failed, dist directory not created")
        return False
    
    print("PASS: Frontend builds successfully")
    
    print("\nSprint 0 tests passed!")
    return True

def test_sprint1():
    """Test Sprint 1 - Launch Screen"""
    print_header("Testing Sprint 1 - Launch Screen & API Key Validation")
    
    # Check essential files
    print("Checking Sprint 1 specific files...")
    required_paths = [
        FRONTEND_DIR / "src" / "pages" / "Launch.tsx",
        BACKEND_DIR / "app" / "routers" / "api_keys.py"
    ]
    
    for path in required_paths:
        if not path.exists():
            print(f"FAIL: {path} not found")
            return False
        print(f"PASS: {path} exists")
    
    # Run specific tests
    print("\nRunning Launch page tests...")
    launch_test = run_command('npm test "Launch"', cwd=FRONTEND_DIR, check=False)
    
    if launch_test.returncode != 0:
        print("FAIL: Launch page tests failed")
        return False
    
    print("PASS: Launch page tests succeeded")
    
    print("\nRunning API key validation tests...")
    api_test = run_command('python -m pytest tests/test_api_keys.py -v', cwd=BACKEND_DIR, check=False)
    
    if api_test.returncode != 0:
        print("FAIL: API key validation tests failed")
        return False
    
    print("PASS: API key validation tests succeeded")
    
    print("\nSprint 1 tests passed!")
    return True

def test_all_sprints():
    """Run tests for all implemented sprints"""
    results = {
        "Sprint 0": test_sprint0(),
        "Sprint 1": test_sprint1(),
        # Add more sprints as they are implemented
    }
    
    print_header("Test Summary")
    for sprint, success in results.items():
        status = "PASSED" if success else "FAILED"
        print(f"{sprint}: {status}")
        
    # Return True only if all sprints passed
    return all(results.values())

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='CodexGUI Test Runner')
    parser.add_argument('--sprint', type=int, help='Test a specific sprint')
    parser.add_argument('--frontend', action='store_true', help='Run frontend tests only')
    parser.add_argument('--backend', action='store_true', help='Run backend tests only')
    parser.add_argument('--check', action='store_true', help='Check requirements only')
    parser.add_argument('--all', action='store_true', help='Run all tests')
    
    args = parser.parse_args()
    
    if args.check or not any([args.sprint, args.frontend, args.backend, args.all]):
        check_requirements()
    
    if args.frontend:
        run_frontend_tests()
    
    if args.backend:
        run_backend_tests()
    
    if args.sprint is not None:
        if args.sprint == 0:
            test_sprint0()
        elif args.sprint == 1:
            test_sprint1()
        else:
            print(f"Sprint {args.sprint} tests not implemented yet.")
    
    if args.all:
        test_all_sprints()
    
    print("\nTest execution completed.")

if __name__ == "__main__":
    main()
