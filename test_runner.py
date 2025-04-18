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

def ask_to_continue(message="Continue with tests? (y/n): "):
    """Ask user if they want to continue or exit"""
    while True:
        response = input(message).lower().strip()
        if response in ("y", "yes"):
            return True
        elif response in ("n", "no"):
            return False
        else:
            print("Please enter 'y' or 'n'.")

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
            if not ask_to_continue("Command failed. Continue anyway? (y/n): "):
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
    if not ask_to_continue("Continue with tests? (y/n): "):
        return False
    return True

def run_frontend_tests():
    """Run frontend tests"""
    print_header("Running Frontend Tests")
    
    # Install dependencies if needed
    if not (FRONTEND_DIR / "node_modules").exists():
        print("Installing frontend dependencies...")
        if not ask_to_continue("Install frontend dependencies? (y/n): "):
            return False
        run_command("npm install", cwd=FRONTEND_DIR)
    
    # Run tests
    print("Running frontend tests...")
    if not ask_to_continue("Execute frontend tests? (y/n): "):
        return False
        
    result = run_command("npm test", cwd=FRONTEND_DIR, check=False)
    
    if result.returncode != 0:
        print("Frontend tests failed.")
        if not ask_to_continue("Tests failed. Continue with the rest of the tests? (y/n): "):
            return False
        return False
    
    print("Frontend tests passed.")
    return True

def run_backend_tests():
    """Run backend tests"""
    print_header("Running Backend Tests")
    
    # Install test dependencies if needed
    print("Installing backend test dependencies...")
    if not ask_to_continue("Install backend test dependencies? (y/n): "):
        return False
        
    run_command("pip install pytest pytest-asyncio httpx", check=False)
    
    # Run tests
    print("Running backend tests...")
    if not ask_to_continue("Execute backend tests? (y/n): "):
        return False
        
    result = run_command("python -m pytest -v", cwd=BACKEND_DIR, check=False)
    
    if result.returncode != 0:
        print("Backend tests failed.")
        if not ask_to_continue("Tests failed. Continue with the rest of the tests? (y/n): "):
            return False
        return False
    
    print("Backend tests passed.")
    return True

def start_backend_server():
    """Start the backend server for integration tests"""
    print("Starting backend server...")
    if not ask_to_continue("Start backend server for integration tests? (y/n): "):
        return None
        
    server_process = subprocess.Popen(
        ["python", "-m", "app.main"], 
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(2)
    
    # Check if server is running
    try:
        conn = http.client.HTTPConnection("localhost", 8000)
        conn.request("GET", "/api/health")
        response = conn.getresponse()
        if response.status != 200:
            print(f"Server not responding correctly: {response.status}")
            server_process.terminate()
            if not ask_to_continue("Server not responding correctly. Continue anyway? (y/n): "):
                return None
        else:
            print("Backend server started successfully.")
    except Exception as e:
        print(f"Failed to connect to server: {e}")
        server_process.terminate()
        if not ask_to_continue("Failed to connect to server. Continue anyway? (y/n): "):
            return None
    
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
    
    failures = 0
    for path in required_paths:
        if not path.exists():
            print(f"FAIL: {path} not found")
            failures += 1
        else:
            print(f"PASS: {path} exists")
    
    if failures > 0:
        print(f"\n{failures} required files/directories are missing.")
        if not ask_to_continue("Continue with tests anyway? (y/n): "):
            return False
    
    # Check if frontend builds
    print("\nChecking if frontend builds...")
    if not ask_to_continue("Test frontend build? (y/n): "):
        return True
        
    build_result = run_command("npm run build", cwd=FRONTEND_DIR, check=False)
    
    if build_result.returncode != 0:
        print("FAIL: Frontend build failed")
        if not ask_to_continue("Frontend build failed. Continue anyway? (y/n): "):
            return False
    
    if not (FRONTEND_DIR / "dist").exists():
        print("FAIL: Frontend build failed, dist directory not created")
        if not ask_to_continue("Dist directory not created. Continue anyway? (y/n): "):
            return False
    else:
        print("PASS: Frontend builds successfully")
    
    print("\nSprint 0 tests completed!")
    return failures == 0

def test_sprint1():
    """Test Sprint 1 - Launch Screen"""
    print_header("Testing Sprint 1 - Launch Screen & API Key Validation")
    
    # Ask if user wants to run Sprint 0 tests first
    if ask_to_continue("Run Sprint 0 tests first? (y/n): "):
        sprint0_passed = test_sprint0()
        print(f"\nSprint 0 tests {'passed' if sprint0_passed else 'failed'}.")
        if not ask_to_continue("Continue with Sprint 1 tests? (y/n): "):
            return False
    
    # Check essential files
    print("Checking Sprint 1 specific files...")
    required_paths = [
        FRONTEND_DIR / "src" / "pages" / "Launch.tsx",
        BACKEND_DIR / "app" / "routers" / "api_keys.py"
    ]
    
    failures = 0
    for path in required_paths:
        if not path.exists():
            print(f"FAIL: {path} not found")
            failures += 1
        else:
            print(f"PASS: {path} exists")
    
    if failures > 0:
        print(f"\n{failures} required Sprint 1 files are missing.")
        if not ask_to_continue("Continue with tests anyway? (y/n): "):
            return False
    
    # Run specific tests
    if ask_to_continue("\nRun Launch page tests? (y/n): "):
        print("\nRunning Launch page tests...")
        launch_test = run_command('npm test "Launch"', cwd=FRONTEND_DIR, check=False)
        
        if launch_test.returncode != 0:
            print("FAIL: Launch page tests failed")
            if not ask_to_continue("Launch tests failed. Continue anyway? (y/n): "):
                return False
            failures += 1
        else:
            print("PASS: Launch page tests succeeded")
    
    if ask_to_continue("\nRun API key validation tests? (y/n): "):
        print("\nRunning API key validation tests...")
        api_test = run_command('python -m pytest tests/test_api_keys.py -v', cwd=BACKEND_DIR, check=False)
        
        if api_test.returncode != 0:
            print("FAIL: API key validation tests failed")
            if not ask_to_continue("API tests failed. Continue anyway? (y/n): "):
                return False
            failures += 1
        else:
            print("PASS: API key validation tests succeeded")
    
    print(f"\nSprint 1 tests completed with {failures} failures!")
    return failures == 0

def test_all_sprints():
    """Run tests for all implemented sprints"""
    print_header("Running All Sprint Tests")
    
    results = {}
    
    # Ask if user wants to run Sprint 0 tests
    if ask_to_continue("Run Sprint 0 tests? (y/n): "):
        results["Sprint 0"] = test_sprint0()
        print(f"\nSprint 0 tests {'passed' if results['Sprint 0'] else 'failed'}.")
    
    # Ask if user wants to run Sprint 1 tests
    if ask_to_continue("Run Sprint 1 tests? (y/n): "):
        results["Sprint 1"] = test_sprint1()
        print(f"\nSprint 1 tests {'passed' if results['Sprint 1'] else 'failed'}.")
    
    # Add more sprints as they are implemented
    
    print_header("Test Summary")
    for sprint, success in results.items():
        status = "PASSED" if success else "FAILED"
        print(f"{sprint}: {status}")
    
    if not results:
        print("No tests were run.")
        return False
        
    # Return True only if all sprints passed
    return all(results.values())

def main_menu():
    """Display interactive menu for test selection"""
    while True:
        print_header("CodexGUI Test Runner")
        print("1. Check requirements")
        print("2. Run frontend tests")
        print("3. Run backend tests")
        print("4. Test Sprint 0 implementation")
        print("5. Test Sprint 1 implementation")
        print("6. Run all sprint tests")
        print("7. Exit")
        
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == "1":
            check_requirements()
        elif choice == "2":
            run_frontend_tests()
        elif choice == "3":
            run_backend_tests()
        elif choice == "4":
            test_sprint0()
        elif choice == "5":
            test_sprint1()
        elif choice == "6":
            test_all_sprints()
        elif choice == "7":
            print("Exiting CodexGUI Test Runner.")
            break
        else:
            print("Invalid choice. Please try again.")
        
        if not ask_to_continue("\nReturn to main menu? (y/n): "):
            print("Exiting CodexGUI Test Runner.")
            break

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='CodexGUI Test Runner')
    parser.add_argument('--sprint', type=int, help='Test a specific sprint')
    parser.add_argument('--frontend', action='store_true', help='Run frontend tests only')
    parser.add_argument('--backend', action='store_true', help='Run backend tests only')
    parser.add_argument('--check', action='store_true', help='Check requirements only')
    parser.add_argument('--all', action='store_true', help='Run all tests')
    parser.add_argument('--interactive', action='store_true', help='Run in interactive menu mode')
    
    args = parser.parse_args()
    
    # If no arguments or interactive mode, show the menu
    if args.interactive or not any([args.sprint, args.frontend, args.backend, args.check, args.all]):
        main_menu()
        return
    
    if args.check:
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
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
