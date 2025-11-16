/**
 * CSS Debugger Component
 * 
 * Add this to your App.tsx temporarily to diagnose CSS issues:
 * 
 * import { CSSDebugger } from './components/CSSDebugger';
 * 
 * Then add <CSSDebugger /> at the top of your App component
 */

import { useEffect, useState } from 'react';

export function CSSDebugger() {
  const [diagnostics, setDiagnostics] = useState({
    inlineStylesWork: false,
    tailwindUtilsWork: false,
    customThemeWorks: false,
    customClassesWork: false,
    cssFileLoaded: false,
    cssFileSize: 0,
  });

  useEffect(() => {
    // Check if CSS file is loaded
    const checkCSSLoaded = async () => {
      try {
        const response = await fetch('/styles/globals.css');
        const text = await response.text();
        setDiagnostics(prev => ({
          ...prev,
          cssFileLoaded: response.ok,
          cssFileSize: text.length,
        }));
      } catch (error) {
        console.error('Failed to load CSS:', error);
      }
    };

    checkCSSLoaded();

    // Check if Tailwind utilities work
    const testDiv = document.createElement('div');
    testDiv.className = 'bg-blue-500';
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);
    const styles = window.getComputedStyle(testDiv);
    const bgColor = styles.backgroundColor;
    
    const tailwindWorks = bgColor && 
      bgColor !== 'rgba(0, 0, 0, 0)' && 
      bgColor !== 'transparent' &&
      bgColor.includes('59, 130, 246'); // rgb(59, 130, 246) = blue-500

    document.body.removeChild(testDiv);

    // Check custom theme
    const themeDiv = document.createElement('div');
    themeDiv.className = 'bg-primary';
    themeDiv.style.display = 'none';
    document.body.appendChild(themeDiv);
    const themeStyles = window.getComputedStyle(themeDiv);
    const themeBgColor = themeStyles.backgroundColor;
    
    const themeWorks = themeBgColor && 
      themeBgColor !== 'rgba(0, 0, 0, 0)' && 
      themeBgColor !== 'transparent';

    document.body.removeChild(themeDiv);

    // Check custom classes
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.style.display = 'none';
    document.body.appendChild(cardDiv);
    const cardStyles = window.getComputedStyle(cardDiv);
    const cardBorderRadius = cardStyles.borderRadius;
    
    const customClassWorks = cardBorderRadius && cardBorderRadius !== '0px';

    document.body.removeChild(cardDiv);

    setDiagnostics(prev => ({
      ...prev,
      inlineStylesWork: true, // If this component renders, inline styles work
      tailwindUtilsWork: tailwindWorks,
      customThemeWorks: themeWorks,
      customClassesWork: customClassWorks,
    }));

    // Log everything to console
    console.log('🔍 CSS Diagnostics:', {
      inlineStylesWork: true,
      tailwindUtilsWork,
      customThemeWorks,
      customClassWorks,
      bgColorDetected: bgColor,
      themeBgDetected: themeBgColor,
      cardBorderRadius: cardBorderRadius,
    });
  }, []);

  const getStatusIcon = (status: boolean) => status ? '✅' : '❌';
  const getStatusColor = (status: boolean) => status ? '#10b981' : '#ef4444';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      maxHeight: '100vh',
      overflowY: 'auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      zIndex: 9999,
      borderLeft: '4px solid white',
      fontFamily: 'monospace',
      fontSize: '12px',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ marginBottom: '15px', borderBottom: '2px solid white', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          🔍 CSS Debugger
        </h2>
        <p style={{ margin: '5px 0 0 0', fontSize: '10px', opacity: 0.9 }}>
          Remove this component once CSS is working
        </p>
      </div>

      {/* Inline Styles Test */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>
            {getStatusIcon(diagnostics.inlineStylesWork)}
          </span>
          <strong>Inline Styles</strong>
        </div>
        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          If you see this box styled, inline styles work
        </div>
      </div>

      {/* Tailwind Utilities Test */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>
            {getStatusIcon(diagnostics.tailwindUtilsWork)}
          </span>
          <strong>Tailwind Utilities</strong>
        </div>
        <div className="bg-blue-500 text-white p-2 rounded mt-2" style={{ fontSize: '11px' }}>
          This should have blue bg, white text, padding
        </div>
        {!diagnostics.tailwindUtilsWork && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
          }}>
            ⚠️ Tailwind classes not applying!<br/>
            Check if globals.css is imported in main.tsx
          </div>
        )}
      </div>

      {/* Custom Theme Test */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>
            {getStatusIcon(diagnostics.customThemeWorks)}
          </span>
          <strong>Custom Theme</strong>
        </div>
        <div className="bg-primary text-primary-foreground p-2 rounded mt-2" style={{ fontSize: '11px' }}>
          Should use custom primary color (#0066ff)
        </div>
        {!diagnostics.customThemeWorks && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
          }}>
            ⚠️ Custom theme not loaded!<br/>
            Check @theme inline section in globals.css
          </div>
        )}
      </div>

      {/* Custom Classes Test */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>
            {getStatusIcon(diagnostics.customClassesWork)}
          </span>
          <strong>Custom Classes</strong>
        </div>
        <div className="card p-4 mt-2" style={{ fontSize: '11px', background: 'white', color: '#1a202c' }}>
          Should have rounded corners and subtle border
        </div>
        {!diagnostics.customClassesWork && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
          }}>
            ⚠️ Custom .card class not working!<br/>
            Check @layer base section in globals.css
          </div>
        )}
      </div>

      {/* CSS File Loading Test */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>
            {getStatusIcon(diagnostics.cssFileLoaded)}
          </span>
          <strong>CSS File Loading</strong>
        </div>
        <div style={{ fontSize: '11px', opacity: 0.9 }}>
          File size: {diagnostics.cssFileSize > 0 
            ? `${(diagnostics.cssFileSize / 1024).toFixed(2)} KB` 
            : 'Not loaded'}
        </div>
        {diagnostics.cssFileLoaded && diagnostics.cssFileSize < 10000 && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(251, 191, 36, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
          }}>
            ⚠️ CSS file is too small (expected 100KB+)<br/>
            Tailwind might not be processing correctly
          </div>
        )}
        {diagnostics.cssFileLoaded && diagnostics.cssFileSize >= 10000 && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(16, 185, 129, 0.3)',
            borderRadius: '4px',
            fontSize: '10px',
          }}>
            ✅ CSS file loaded and has good size
          </div>
        )}
      </div>

      {/* Browser Info */}
      <div style={{ 
        padding: '10px', 
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '8px',
        fontSize: '10px',
      }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>Browser Info:</strong>
        <div style={{ opacity: 0.9 }}>
          {navigator.userAgent.includes('Chrome') && '🌐 Chrome/Edge'}
          {navigator.userAgent.includes('Firefox') && '🦊 Firefox'}
          {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && '🧭 Safari'}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid rgba(255,255,255,0.3)' }}>
        <strong style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
          Quick Actions:
        </strong>
        <div style={{ fontSize: '10px', opacity: 0.9, lineHeight: '1.6' }}>
          1. Open DevTools (F12)<br/>
          2. Check Console for errors<br/>
          3. Check Network tab for globals.css<br/>
          4. Try: rm -rf node_modules && npm install<br/>
          5. See: QUICK_CSS_FIX.md
        </div>
      </div>

      {/* Summary Status */}
      <div style={{ 
        marginTop: '15px',
        padding: '12px',
        background: Object.values(diagnostics).every(v => v) 
          ? 'rgba(16, 185, 129, 0.4)' 
          : 'rgba(239, 68, 68, 0.4)',
        borderRadius: '8px',
        textAlign: 'center',
        fontWeight: 'bold',
      }}>
        {Object.values(diagnostics).every(v => v) 
          ? '✅ All CSS systems working!'
          : '⚠️ Some CSS issues detected'}
      </div>
    </div>
  );
}
