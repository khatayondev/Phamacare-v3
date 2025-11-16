@echo off
REM Cleanup script for removing debugging files before GitHub push
REM This removes temporary debugging documentation and test components

echo.
echo ========================================
echo   Cleanup Script for GitHub Push
echo ========================================
echo.

setlocal enabledelayedexpansion
set removed_count=0

echo Removing CSS debugging documentation...
if exist "CSS_CHEAT_SHEET.md" (del "CSS_CHEAT_SHEET.md" && echo   - Removed: CSS_CHEAT_SHEET.md && set /a removed_count+=1)
if exist "CSS_DEBUGGING_GUIDE.md" (del "CSS_DEBUGGING_GUIDE.md" && echo   - Removed: CSS_DEBUGGING_GUIDE.md && set /a removed_count+=1)
if exist "CSS_FIX_INDEX.md" (del "CSS_FIX_INDEX.md" && echo   - Removed: CSS_FIX_INDEX.md && set /a removed_count+=1)
if exist "COMPLETE_DEBUG_WORKFLOW.md" (del "COMPLETE_DEBUG_WORKFLOW.md" && echo   - Removed: COMPLETE_DEBUG_WORKFLOW.md && set /a removed_count+=1)
if exist "HOW_TO_ADD_DEBUGGER.md" (del "HOW_TO_ADD_DEBUGGER.md" && echo   - Removed: HOW_TO_ADD_DEBUGGER.md && set /a removed_count+=1)
if exist "IMMEDIATE_ACTION_PLAN.md" (del "IMMEDIATE_ACTION_PLAN.md" && echo   - Removed: IMMEDIATE_ACTION_PLAN.md && set /a removed_count+=1)
if exist "QUICK_CSS_FIX.md" (del "QUICK_CSS_FIX.md" && echo   - Removed: QUICK_CSS_FIX.md && set /a removed_count+=1)
if exist "README_CSS_FIX.md" (del "README_CSS_FIX.md" && echo   - Removed: README_CSS_FIX.md && set /a removed_count+=1)
if exist "START_HERE_CSS_FIX.md" (del "START_HERE_CSS_FIX.md" && echo   - Removed: START_HERE_CSS_FIX.md && set /a removed_count+=1)
if exist "STYLING_FIX_APPLIED.md" (del "STYLING_FIX_APPLIED.md" && echo   - Removed: STYLING_FIX_APPLIED.md && set /a removed_count+=1)
echo.

echo Removing debug scripts...
if exist "debug-css.sh" (del "debug-css.sh" && echo   - Removed: debug-css.sh && set /a removed_count+=1)
if exist "debug-css.bat" (del "debug-css.bat" && echo   - Removed: debug-css.bat && set /a removed_count+=1)
if exist "fix-css-auto.sh" (del "fix-css-auto.sh" && echo   - Removed: fix-css-auto.sh && set /a removed_count+=1)
if exist "fix-css-auto.bat" (del "fix-css-auto.bat" && echo   - Removed: fix-css-auto.bat && set /a removed_count+=1)
if exist "css-test.html" (del "css-test.html" && echo   - Removed: css-test.html && set /a removed_count+=1)
echo.

echo Removing fix/changelog files...
if exist "FIXES_APPLIED_TODAY.md" (del "FIXES_APPLIED_TODAY.md" && echo   - Removed: FIXES_APPLIED_TODAY.md && set /a removed_count+=1)
if exist "FIXES_CHANGELOG.md" (del "FIXES_CHANGELOG.md" && echo   - Removed: FIXES_CHANGELOG.md && set /a removed_count+=1)
if exist "LATEST_FIXES_SUMMARY.md" (del "LATEST_FIXES_SUMMARY.md" && echo   - Removed: LATEST_FIXES_SUMMARY.md && set /a removed_count+=1)
if exist "SYSTEM_FIXES_SUMMARY.md" (del "SYSTEM_FIXES_SUMMARY.md" && echo   - Removed: SYSTEM_FIXES_SUMMARY.md && set /a removed_count+=1)
if exist "COMPLETE_FIX_README.md" (del "COMPLETE_FIX_README.md" && echo   - Removed: COMPLETE_FIX_README.md && set /a removed_count+=1)
if exist "DASHBOARD_CACHE_FIX.md" (del "DASHBOARD_CACHE_FIX.md" && echo   - Removed: DASHBOARD_CACHE_FIX.md && set /a removed_count+=1)
if exist "DASHBOARD_CACHE_COMPLETE.md" (del "DASHBOARD_CACHE_COMPLETE.md" && echo   - Removed: DASHBOARD_CACHE_COMPLETE.md && set /a removed_count+=1)
if exist "UI_BLINKING_FIX.md" (del "UI_BLINKING_FIX.md" && echo   - Removed: UI_BLINKING_FIX.md && set /a removed_count+=1)
if exist "QUICK_FIX_REFERENCE.md" (del "QUICK_FIX_REFERENCE.md" && echo   - Removed: QUICK_FIX_REFERENCE.md && set /a removed_count+=1)
echo.

echo Removing redundant setup/guide files...
if exist "LOCAL_SETUP_GUIDE.md" (del "LOCAL_SETUP_GUIDE.md" && echo   - Removed: LOCAL_SETUP_GUIDE.md && set /a removed_count+=1)
if exist "SETUP_GUIDE.md" (del "SETUP_GUIDE.md" && echo   - Removed: SETUP_GUIDE.md && set /a removed_count+=1)
if exist "START_HERE.md" (del "START_HERE.md" && echo   - Removed: START_HERE.md && set /a removed_count+=1)
if exist "QUICK_START.md" (del "QUICK_START.md" && echo   - Removed: QUICK_START.md && set /a removed_count+=1)
if exist "PUSH_TO_GITHUB.md" (del "PUSH_TO_GITHUB.md" && echo   - Removed: PUSH_TO_GITHUB.md && set /a removed_count+=1)
if exist "GITHUB_SETUP.md" (del "GITHUB_SETUP.md" && echo   - Removed: GITHUB_SETUP.md && set /a removed_count+=1)
if exist "AUTH_DEBUG_GUIDE.md" (del "AUTH_DEBUG_GUIDE.md" && echo   - Removed: AUTH_DEBUG_GUIDE.md && set /a removed_count+=1)
if exist "COMMANDS.md" (del "COMMANDS.md" && echo   - Removed: COMMANDS.md && set /a removed_count+=1)
if exist "MASTER_PROMPT.md" (del "MASTER_PROMPT.md" && echo   - Removed: MASTER_PROMPT.md && set /a removed_count+=1)
if exist "TROUBLESHOOTING_GUIDE.md" (del "TROUBLESHOOTING_GUIDE.md" && echo   - Removed: TROUBLESHOOTING_GUIDE.md && set /a removed_count+=1)
echo.

echo Removing LICENSE directory with temp files...
if exist "LICENSE\" (rd /s /q "LICENSE" && echo   - Removed directory: LICENSE && set /a removed_count+=1)
echo.

echo Removing debug/test components...
if exist "components\CSSDebugger.tsx" (del "components\CSSDebugger.tsx" && echo   - Removed: components\CSSDebugger.tsx && set /a removed_count+=1)
if exist "components\AuthDebugger.tsx" (del "components\AuthDebugger.tsx" && echo   - Removed: components\AuthDebugger.tsx && set /a removed_count+=1)
if exist "components\DataFlowDebugger.tsx" (del "components\DataFlowDebugger.tsx" && echo   - Removed: components\DataFlowDebugger.tsx && set /a removed_count+=1)
if exist "components\PaymentProcessingTest.tsx" (del "components\PaymentProcessingTest.tsx" && echo   - Removed: components\PaymentProcessingTest.tsx && set /a removed_count+=1)
if exist "components\PrescriptionEventTest.tsx" (del "components\PrescriptionEventTest.tsx" && echo   - Removed: components\PrescriptionEventTest.tsx && set /a removed_count+=1)
if exist "components\PrescriptionFlowTest.tsx" (del "components\PrescriptionFlowTest.tsx" && echo   - Removed: components\PrescriptionFlowTest.tsx && set /a removed_count+=1)
if exist "components\SimpleStorageTest.tsx" (del "components\SimpleStorageTest.tsx" && echo   - Removed: components\SimpleStorageTest.tsx && set /a removed_count+=1)
if exist "components\WorkflowTest.tsx" (del "components\WorkflowTest.tsx" && echo   - Removed: components\WorkflowTest.tsx && set /a removed_count+=1)
if exist "components\SystemHealthDashboard.tsx" (del "components\SystemHealthDashboard.tsx" && echo   - Removed: components\SystemHealthDashboard.tsx && set /a removed_count+=1)
if exist "components\SystemMonitoring.tsx" (del "components\SystemMonitoring.tsx" && echo   - Removed: components\SystemMonitoring.tsx && set /a removed_count+=1)
if exist "components\SystemStatus.tsx" (del "components\SystemStatus.tsx" && echo   - Removed: components\SystemStatus.tsx && set /a removed_count+=1)
if exist "components\WorkflowStatus.tsx" (del "components\WorkflowStatus.tsx" && echo   - Removed: components\WorkflowStatus.tsx && set /a removed_count+=1)
if exist "components\CompletionStatus.tsx" (del "components\CompletionStatus.tsx" && echo   - Removed: components\CompletionStatus.tsx && set /a removed_count+=1)
if exist "components\ProductionReadyReport.tsx" (del "components\ProductionReadyReport.tsx" && echo   - Removed: components\ProductionReadyReport.tsx && set /a removed_count+=1)
echo.

echo ==========================================
echo   Cleanup Complete!
echo ==========================================
echo.
echo Summary:
echo   - Removed !removed_count! files/directories
echo.
echo Remaining documentation files:
dir /b *.md 2>nul
echo.
echo Your repository is now clean and ready for GitHub!
echo.
echo Next steps:
echo   1. Review remaining files: dir
echo   2. Add changes: git add .
echo   3. Commit: git commit -m "Clean up debugging documentation for production"
echo   4. Push: git push origin main
echo.
pause
