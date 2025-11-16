#!/bin/bash

# Cleanup script for removing debugging files before GitHub push
# This removes temporary debugging documentation and test components

echo "🧹 Starting cleanup for GitHub push..."
echo ""

# Counter for removed files
removed_count=0

# Function to safely remove file and count
remove_file() {
    if [ -f "$1" ]; then
        rm "$1"
        echo "  ✓ Removed: $1"
        ((removed_count++))
    fi
}

# Function to safely remove directory and count
remove_dir() {
    if [ -d "$1" ]; then
        rm -rf "$1"
        echo "  ✓ Removed directory: $1"
        ((removed_count++))
    fi
}

echo "📄 Removing CSS debugging documentation..."
remove_file "CSS_CHEAT_SHEET.md"
remove_file "CSS_DEBUGGING_GUIDE.md"
remove_file "CSS_FIX_INDEX.md"
remove_file "COMPLETE_DEBUG_WORKFLOW.md"
remove_file "HOW_TO_ADD_DEBUGGER.md"
remove_file "IMMEDIATE_ACTION_PLAN.md"
remove_file "QUICK_CSS_FIX.md"
remove_file "README_CSS_FIX.md"
remove_file "START_HERE_CSS_FIX.md"
remove_file "STYLING_FIX_APPLIED.md"
echo ""

echo "🔧 Removing debug scripts..."
remove_file "debug-css.sh"
remove_file "debug-css.bat"
remove_file "fix-css-auto.sh"
remove_file "fix-css-auto.bat"
remove_file "css-test.html"
echo ""

echo "📋 Removing fix/changelog files..."
remove_file "FIXES_APPLIED_TODAY.md"
remove_file "FIXES_CHANGELOG.md"
remove_file "LATEST_FIXES_SUMMARY.md"
remove_file "SYSTEM_FIXES_SUMMARY.md"
remove_file "COMPLETE_FIX_README.md"
remove_file "DASHBOARD_CACHE_FIX.md"
remove_file "DASHBOARD_CACHE_COMPLETE.md"
remove_file "UI_BLINKING_FIX.md"
remove_file "QUICK_FIX_REFERENCE.md"
echo ""

echo "📚 Removing redundant setup/guide files..."
remove_file "LOCAL_SETUP_GUIDE.md"
remove_file "SETUP_GUIDE.md"
remove_file "START_HERE.md"
remove_file "QUICK_START.md"
remove_file "PUSH_TO_GITHUB.md"
remove_file "GITHUB_SETUP.md"
remove_file "AUTH_DEBUG_GUIDE.md"
remove_file "COMMANDS.md"
remove_file "MASTER_PROMPT.md"
remove_file "TROUBLESHOOTING_GUIDE.md"
echo ""

echo "🗑️ Removing LICENSE directory with temp files..."
remove_dir "LICENSE"
echo ""

echo "🧪 Removing debug/test components..."
remove_file "components/CSSDebugger.tsx"
remove_file "components/AuthDebugger.tsx"
remove_file "components/DataFlowDebugger.tsx"
remove_file "components/PaymentProcessingTest.tsx"
remove_file "components/PrescriptionEventTest.tsx"
remove_file "components/PrescriptionFlowTest.tsx"
remove_file "components/SimpleStorageTest.tsx"
remove_file "components/WorkflowTest.tsx"
remove_file "components/SystemHealthDashboard.tsx"
remove_file "components/SystemMonitoring.tsx"
remove_file "components/SystemStatus.tsx"
remove_file "components/WorkflowStatus.tsx"
remove_file "components/CompletionStatus.tsx"
remove_file "components/ProductionReadyReport.tsx"
echo ""

echo "=========================================="
echo "✅ Cleanup complete!"
echo "=========================================="
echo ""
echo "📊 Summary:"
echo "  • Removed $removed_count files/directories"
echo ""
echo "📦 Remaining documentation files:"
ls -1 *.md 2>/dev/null | sort
echo ""
echo "✨ Your repository is now clean and ready for GitHub!"
echo ""
echo "🚀 Next steps:"
echo "  1. Review remaining files: ls -la"
echo "  2. Add changes: git add ."
echo "  3. Commit: git commit -m 'Clean up debugging documentation for production'"
echo "  4. Push: git push origin main"
echo ""
