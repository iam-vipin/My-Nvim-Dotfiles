#!/bin/bash
#
# Quick test runner for V1 vs V2 API comparison
#
# Usage:
#   ./run_tests.sh                    # Interactive mode
#   ./run_tests.sh <token>            # With token only
#   ./run_tests.sh <token> <workspace-id>  # With token and workspace

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  V1 vs V2 API Testing Suite${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check if dependencies are installed
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! python3 -c "import requests" 2> /dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r test_requirements.txt
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies OK${NC}"
fi
echo ""

# Get parameters
TOKEN="${1:-}"
WORKSPACE_ID="${2:-}"
BASE_URL="${BASE_URL:-http://localhost:8002}"

# Interactive mode if no token provided
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}Interactive Mode${NC}"
    echo ""
    echo "To get your session token:"
    echo "  1. Open browser DevTools (F12)"
    echo "  2. Go to Application → Cookies"
    echo "  3. Find 'session_id' cookie"
    echo "  4. Copy the value"
    echo ""
    read -p "Enter session token: " TOKEN
    echo ""
    
    read -p "Enter workspace ID (optional, press Enter to skip): " WORKSPACE_ID
    echo ""
    
    read -p "Enter base URL (default: http://localhost:8002): " CUSTOM_URL
    if [ ! -z "$CUSTOM_URL" ]; then
        BASE_URL="$CUSTOM_URL"
    fi
    echo ""
fi

# Build command
CMD="python3 test_v1_v2_comparison.py --token \"$TOKEN\" --base-url \"$BASE_URL\""

if [ ! -z "$WORKSPACE_ID" ]; then
    CMD="$CMD --workspace-id \"$WORKSPACE_ID\""
fi

# Ask for verbose mode
if [ -z "${1:-}" ]; then  # Only in interactive mode
    read -p "Enable verbose mode? (y/N): " VERBOSE
    if [[ $VERBOSE =~ ^[Yy]$ ]]; then
        CMD="$CMD --verbose"
    fi
    echo ""
fi

# Show configuration
echo -e "${CYAN}Configuration:${NC}"
echo -e "  Base URL: ${BASE_URL}"
echo -e "  Session Token: ${GREEN}✓${NC}"
if [ ! -z "$WORKSPACE_ID" ]; then
    echo -e "  Workspace ID: ${GREEN}${WORKSPACE_ID}${NC}"
else
    echo -e "  Workspace ID: ${YELLOW}Not provided (some tests will be skipped)${NC}"
fi
echo ""

echo -e "${CYAN}Running tests...${NC}"
echo ""

# Run tests
eval $CMD
EXIT_CODE=$?

echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  All tests passed! ✅${NC}"
    echo -e "${GREEN}============================================${NC}"
else
    echo -e "${RED}============================================${NC}"
    echo -e "${RED}  Some tests failed ❌${NC}"
    echo -e "${RED}============================================${NC}"
    echo ""
    echo -e "${YELLOW}Check test_results.json for details${NC}"
fi

exit $EXIT_CODE

