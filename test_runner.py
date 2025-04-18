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
import logging
import datetime
from pathlib import Path

# Define project paths
PROJECT_ROOT = Path(__file__).parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"
BACKEND_DIR = PROJECT_ROOT / "backend"
TESTS_DIR = PROJECT_ROOT / "tests"
LOGS_DIR = PROJECT_ROOT / "logs"

# Ensure logs directory exists
os.makedirs(LOGS_DIR, exist_ok=True)

# Set up logging
current_time = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
log_file = LOGS_DIR / f"test_run_{current_time}.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CodexGUI_TestRunner")

def print_header(title):
    """Print a formatted header"""
    header = "\n" + "=" * 50 + f"\n  {title}\n" + "=" * 50 + "\n"
    print(header)
    logger.info(header)

def ask_to_continue(message="Continue with tests? (y/n): "):
    """Ask user if they want to continue or exit"""
    while True:
        response = input(message).lower().strip()
        logger.info(f"User prompted: {message} Response: {response}")
        if response in ("y", "yes"):
            return True
        elif response in ("n", "no"):
            return False
        else:
            print("Please enter 'y' or 'n'.")

def run_command(command, cwd=None, check=True):
    """Run a shell command and return the result"""
    logger.info(f"Running command: {command} in directory: {cwd or os.getcwd()}")
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            check=check,
            capture_output=True,
            text=True
        )
        # Log command output
        if result.stdout:
            logger.info(f"Command stdout:\n{result.stdout}")
        if result.stderr:
            logger.warning(f"Command stderr:\n{result.stderr}")
        
        logger.info(f"Command exit code: {result.returncode}")
        return result
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e}")
        logger.info(f"Command stdout:\n{e.stdout}")
        logger.error(f"Command stderr:\n{e.stderr}")
        if check:
            if not ask_to_continue("Command failed. Continue anyway? (y/n): "):
                logger.info("User chose to exit after command failure")
                sys.exit(1)
        return e

def check_requirements():
    """Check if all requirements are installed"""
    print_header("Checking Requirements")
    
    # Check Python version
    python_version = run_command("python --version")
    python_ver_str = python_version.stdout.strip()
    print(f"Python version: {python_ver_str}")
    
    # Check Node.js version
    node_version = run_command("node --version")
    node_ver_str = node_version.stdout.strip()
    print(f"Node.js version: {node_ver_str}")
    
    # Check npm version
    npm_version = run_command("npm --version")
    npm_ver_str = npm_version.stdout.strip()
    print(f"npm version: {npm_ver_str}")
    
    # Check Git version
    git_version = run_command("git --version")
    git_ver_str = git_version.stdout.strip()
    print(f"Git version: {git_ver_str}")
    
    logger.info(f"Environment: Python={python_ver_str}, Node.js={node_ver_str}, npm={npm_ver_str}, Git={git_ver_str}")
    print("\nAll requirements checked.")
    if not ask_to_continue("Continue with tests? (y/n): "):
        return False
    return True

def run_frontend_tests():
    """Run frontend tests"""
    print_header("Running Frontend Tests")
    
    # Install dependencies if needed
    if not (FRONTEND_DIR / "node_modules").exists():
        logger.info("Frontend node_modules not found, need to install dependencies")
        print("Installing frontend dependencies...")
        if not ask_to_continue("Install frontend dependencies? (y/n): "):
            logger.info("User chose not to install frontend dependencies")
            return False
        run_command("npm install", cwd=FRONTEND_DIR)
    
    # Run tests
    print("Running frontend tests...")
    if not ask_to_continue("Execute frontend tests? (y/n): "):
        logger.info("User chose not to run frontend tests")
        return False
        
    result = run_command("npm test", cwd=FRONTEND_DIR, check=False)
    
    if result.returncode != 0:
        logger.error("Frontend tests failed")
        print("Frontend tests failed.")
        if not ask_to_continue("Tests failed. Continue with the rest of the tests? (y/n): "):
            return False
        return False
    
    logger.info("Frontend tests passed")
    print("Frontend tests passed.")
    return True

def run_backend_tests():
    """Run backend tests"""
    print_header("Running Backend Tests")
    
    # Install test dependencies if needed
    print("Installing backend test dependencies...")
    if not ask_to_continue("Install backend test dependencies? (y/n): "):
        logger.info("User chose not to install backend test dependencies")
        return False
        
    run_command("pip install pytest pytest-asyncio httpx", check=False)
    
    # Run tests
    print("Running backend tests...")
    if not ask_to_continue("Execute backend tests? (y/n): "):
        logger.info("User chose not to run backend tests")
        return False
        
    result = run_command("python -m pytest -v", cwd=BACKEND_DIR, check=False)
    
    if result.returncode != 0:
        logger.error("Backend tests failed")
        print("Backend tests failed.")
        if not ask_to_continue("Tests failed. Continue with the rest of the tests? (y/n): "):
            return False
        return False
    
    logger.info("Backend tests passed")
    print("Backend tests passed.")
    return True

def start_backend_server():
    """Start the backend server for integration tests"""
    print("Starting backend server...")
    if not ask_to_continue("Start backend server for integration tests? (y/n): "):
        logger.info("User chose not to start backend server")
        return None
        
    logger.info("Starting backend server")
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
            error_msg = f"Server not responding correctly: {response.status}"
            logger.error(error_msg)
            print(error_msg)
            server_process.terminate()
            if not ask_to_continue("Server not responding correctly. Continue anyway? (y/n): "):
                return None
        else:
            logger.info("Backend server started successfully")
            print("Backend server started successfully.")
    except Exception as e:
        error_msg = f"Failed to connect to server: {e}"
        logger.error(error_msg)
        print(error_msg)
        server_process.terminate()
        if not ask_to_continue("Failed to connect to server. Continue anyway? (y/n): "):
            return None
    
    return server_process

def stop_backend_server(server_process):
    """Stop the backend server"""
    if server_process:
        logger.info("Stopping backend server")
        print("Stopping backend server...")
        server_process.terminate()
        time.sleep(1)
        print("Backend server stopped.")

def test_sprint0():
    """Test Sprint 0 - Project Setup"""
    print_header("Testing Sprint 0 - Project Setup")
    logger.info("Starting Sprint 0 tests")
    
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
            fail_msg = f"FAIL: {path} not found"
            logger.error(fail_msg)
            print(fail_msg)
            failures += 1
        else:
            pass_msg = f"PASS: {path} exists"
            logger.info(pass_msg)
            print(pass_msg)
    
    if failures > 0:
        logger.warning(f"{failures} required files/directories are missing")
        print(f"\n{failures} required files/directories are missing.")
        if not ask_to_continue("Continue with tests anyway? (y/n): "):
            return False
    
    # Check if frontend builds
    print("\nChecking if frontend builds...")
    if not ask_to_continue("Test frontend build? (y/n): "):
        logger.info("User chose to skip frontend build test")
        return True
        
    logger.info("Testing frontend build")
    build_result = run_command("npm run build", cwd=FRONTEND_DIR, check=False)
    
    if build_result.returncode != 0:
        logger.error("Frontend build failed")
        print("FAIL: Frontend build failed")
        if not ask_to_continue("Frontend build failed. Continue anyway? (y/n): "):
            return False
    
    if not (FRONTEND_DIR / "dist").exists():
        logger.error("Frontend build failed, dist directory not created")
        print("FAIL: Frontend build failed, dist directory not created")
        if not ask_to_continue("Dist directory not created. Continue anyway? (y/n): "):
            return False
    else:
        logger.info("Frontend builds successfully")
        print("PASS: Frontend builds successfully")
    
    print("\nSprint 0 tests completed!")
    logger.info(f"Sprint 0 tests completed with {failures} failures")
    return failures == 0

def test_sprint1():
    """Test Sprint 1 - Launch Screen"""
    print_header("Testing Sprint 1 - Launch Screen & API Key Validation")
    logger.info("Starting Sprint 1 tests")
    
    # Ask if user wants to run Sprint 0 tests first
    if ask_to_continue("Run Sprint 0 tests first? (y/n): "):
        logger.info("User chose to run Sprint 0 tests first")
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
            fail_msg = f"FAIL: {path} not found"
            logger.error(fail_msg)
            print(fail_msg)
            failures += 1
        else:
            pass_msg = f"PASS: {path} exists"
            logger.info(pass_msg)
            print(pass_msg)
    
    if failures > 0:
        logger.warning(f"{failures} required Sprint 1 files are missing")
        print(f"\n{failures} required Sprint 1 files are missing.")
        if not ask_to_continue("Continue with tests anyway? (y/n): "):
            return False
    
    # Run specific tests
    if ask_to_continue("\nRun Launch page tests? (y/n): "):
        logger.info("Running Launch page tests")
        print("\nRunning Launch page tests...")
        launch_test = run_command('npm test "Launch"', cwd=FRONTEND_DIR, check=False)
        
        if launch_test.returncode != 0:
            logger.error("Launch page tests failed")
            print("FAIL: Launch page tests failed")
            if not ask_to_continue("Launch tests failed. Continue anyway? (y/n): "):
                return False
            failures += 1
        else:
            logger.info("Launch page tests succeeded")
            print("PASS: Launch page tests succeeded")
    
    if ask_to_continue("\nRun API key validation tests? (y/n): "):
        logger.info("Running API key validation tests")
        print("\nRunning API key validation tests...")
        api_test = run_command('python -m pytest tests/test_api_keys.py -v', cwd=BACKEND_DIR, check=False)
        
        if api_test.returncode != 0:
            logger.error("API key validation tests failed")
            print("FAIL: API key validation tests failed")
            if not ask_to_continue("API tests failed. Continue anyway? (y/n): "):
                return False
            failures += 1
        else:
            logger.info("API key validation tests succeeded")
            print("PASS: API key validation tests succeeded")
    
    print(f"\nSprint 1 tests completed with {failures} failures!")
    logger.info(f"Sprint 1 tests completed with {failures} failures")
    return failures == 0

def test_all_sprints():
    """Run tests for all implemented sprints"""
    print_header("Running All Sprint Tests")
    logger.info("Starting tests for all sprints")
    
    results = {}
    
    # Ask if user wants to run Sprint 0 tests
    if ask_to_continue("Run Sprint 0 tests? (y/n): "):
        logger.info("User chose to run Sprint 0 tests")
        results["Sprint 0"] = test_sprint0()
        print(f"\nSprint 0 tests {'passed' if results['Sprint 0'] else 'failed'}.")
    
    # Ask if user wants to run Sprint 1 tests
    if ask_to_continue("Run Sprint 1 tests? (y/n): "):
        logger.info("User chose to run Sprint 1 tests")
        results["Sprint 1"] = test_sprint1()
        print(f"\nSprint 1 tests {'passed' if results['Sprint 1'] else 'failed'}.")
    
    # Add more sprints as they are implemented
    
    print_header("Test Summary")
    summary = []
    for sprint, success in results.items():
        status = "PASSED" if success else "FAILED"
        summary_line = f"{sprint}: {status}"
        summary.append(summary_line)
        print(summary_line)
    
    logger.info("Test Summary:\n" + "\n".join(summary))
    
    if not results:
        logger.warning("No tests were run")
        print("No tests were run.")
        return False
        
    # Return True only if all sprints passed
    all_passed = all(results.values())
    logger.info(f"All tests {'passed' if all_passed else 'had failures'}")
    return all_passed

def main_menu():
    """Display interactive menu for test selection"""
    logger.info("Entering main menu")
    
    while True:
        print_header("CodexGUI Test Runner")
        print("1. Check requirements")
        print("2. Run frontend tests")
        print("3. Run backend tests")
        print("4. Test Sprint 0 implementation")
        print("5. Test Sprint 1 implementation")
        print("6. Run all sprint tests")
        print("7. View latest log file")
        print("8. Exit")
        
        choice = input("\nEnter your choice (1-8): ").strip()
        logger.info(f"User selected menu option: {choice}")
        
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
            # Show the log file path and offer to open it
            print(f"\nLatest log file: {log_file}")
            if os.name == 'nt':  # Windows
                if ask_to_continue("Open log file? (y/n): "):
                    os.system(f"start notepad {log_file}")
            else:  # macOS or Linux
                if ask_to_continue("Print log file content? (y/n): "):
                    with open(log_file, 'r') as f:
                        print(f.read())
        elif choice == "8":
            logger.info("Exiting CodexGUI Test Runner")
            print("Exiting CodexGUI Test Runner.")
            break
        else:
            logger.warning(f"Invalid menu choice: {choice}")
            print("Invalid choice. Please try again.")
        
        if not ask_to_continue("\nReturn to main menu? (y/n): "):
            logger.info("User chose to exit from main menu")
            print("Exiting CodexGUI Test Runner.")
            break

def main():
    """Main function"""
    logger.info("Test Runner started")
    logger.info(f"Log file: {log_file}")
    
    print(f"Test log will be saved to: {log_file}")
    
    parser = argparse.ArgumentParser(description='CodexGUI Test Runner')
    parser.add_argument('--sprint', type=int, help='Test a specific sprint')
    parser.add_argument('--frontend', action='store_true', help='Run frontend tests only')
    parser.add_argument('--backend', action='store_true', help='Run backend tests only')
    parser.add_argument('--check', action='store_true', help='Check requirements only')
    parser.add_argument('--all', action='store_true', help='Run all tests')
    parser.add_argument('--interactive', action='store_true', help='Run in interactive menu mode')
    parser.add_argument('--log', type=str, help='Specify log file path')
    
    args = parser.parse_args()
    logger.info(f"Command line arguments: {args}")
    
    # If custom log file specified
    if args.log:
        log_path = Path(args.log)
        # Set up additional file handler for the specified log file
        file_handler = logging.FileHandler(log_path)
        file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
        logger.addHandler(file_handler)
        logger.info(f"Additional log file: {log_path}")
        print(f"Additional log file: {log_path}")
    
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
            msg = f"Sprint {args.sprint} tests not implemented yet."
            logger.warning(msg)
            print(msg)
    
    if args.all:
        test_all_sprints()
    
    logger.info("Test execution completed")
    print("\nTest execution completed.")
    print(f"Test log saved to: {log_file}")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
