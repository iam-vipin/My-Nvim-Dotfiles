# Plane Intelligence

## 📚 API Documentation

**For V1 to V2 API Migration & Testing:**  
See the comprehensive guide: [`docs/V1_VS_V2_TESTING_GUIDE.md`](docs/V1_VS_V2_TESTING_GUIDE.md)

This single document covers:
- ✅ 20 Automated tests for API validation
- ✅ 41 Migrated endpoints with curl examples
- ✅ RESTful design following White House Web API Standards
- ✅ Step-by-step testing workflows

## 🚀 Quick Test

```bash
# Run automated tests
cd tests/
./run_tests.sh <your-session-token> <workspace-id>

# Or run specific test
python test_v1_v2_comparison.py --token <token> --test health

# List all available tests
python test_v1_v2_comparison.py --list-tests
```

## 📖 Key Files

- **[V1_VS_V2_TESTING_GUIDE.md](docs/V1_VS_V2_TESTING_GUIDE.md)** - Complete migration & testing guide
- **[test_v1_v2_comparison.py](test_v1_v2_comparison.py)** - Automated testing script
- **[run_tests.sh](run_tests.sh)** - Easy test runner
- **[test_requirements.txt](test_requirements.txt)** - Test dependencies
