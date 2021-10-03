import React from 'react';
import { render } from 'react-dom';
import Root from './injected/Root';

(() => {
  const root = document.getElementById('root');
  const config = {
    childList: true,
    subtree: true,
  };

  const observer = new MutationObserver((mutations, currObserver) => {
    const chartWrapper = document.getElementById('chart-header');

    if (chartWrapper) {
      const injectWrapper = document.createElement('div');

      injectWrapper.className = 'ui-panel bg-wrap injected-by-extension';
      chartWrapper.parentNode.insertBefore(injectWrapper, chartWrapper.nextSibling.nextSibling);
      currObserver.disconnect();
      render(<Root />, injectWrapper);
    }
  });

  observer.observe(root, config);
})();

(() => {
  const simpleBarStyle = document.createElement('style');
  simpleBarStyle.textContent =
    "[data-simplebar]{position:relative;flex-direction:column;flex-wrap:wrap;justify-content:flex-start;align-content:flex-start;align-items:flex-start}.simplebar-wrapper{overflow:hidden;width:inherit;height:inherit;max-width:inherit;max-height:inherit}.simplebar-mask{direction:inherit;position:absolute;overflow:hidden;padding:0;margin:0;left:0;top:0;bottom:0;right:0;width:auto!important;height:auto!important;z-index:0}.simplebar-offset{direction:inherit!important;box-sizing:inherit!important;resize:none!important;position:absolute;top:0;left:0;bottom:0;right:0;padding:0;margin:0;-webkit-overflow-scrolling:touch}.simplebar-content-wrapper{direction:inherit;box-sizing:border-box!important;position:relative;display:block;height:100%;width:auto;max-width:100%;max-height:100%;scrollbar-width:none;-ms-overflow-style:none}.simplebar-content-wrapper::-webkit-scrollbar,.simplebar-hide-scrollbar::-webkit-scrollbar{width:0;height:0}.simplebar-content:after,.simplebar-content:before{content:' ';display:table}.simplebar-placeholder{max-height:100%;max-width:100%;width:100%;pointer-events:none}.simplebar-height-auto-observer-wrapper{box-sizing:inherit!important;height:100%;width:100%;max-width:1px;position:relative;float:left;max-height:1px;overflow:hidden;z-index:-1;padding:0;margin:0;pointer-events:none;flex-grow:inherit;flex-shrink:0;flex-basis:0}.simplebar-height-auto-observer{box-sizing:inherit;display:block;opacity:0;position:absolute;top:0;left:0;height:1000%;width:1000%;min-height:1px;min-width:1px;overflow:hidden;pointer-events:none;z-index:-1}.simplebar-track{z-index:1;position:absolute;right:0;bottom:0;pointer-events:none;overflow:hidden}[data-simplebar].simplebar-dragging .simplebar-content{pointer-events:none;user-select:none;-webkit-user-select:none}[data-simplebar].simplebar-dragging .simplebar-track{pointer-events:all}.simplebar-scrollbar{position:absolute;left:0;right:0;min-height:10px}.simplebar-scrollbar:before{position:absolute;content:'';background:#000;border-radius:7px;left:2px;right:2px;opacity:0;transition:opacity .2s linear}.simplebar-scrollbar.simplebar-visible:before{opacity:.5;transition:opacity 0s linear}.simplebar-track.simplebar-vertical{top:0;width:11px}.simplebar-track.simplebar-vertical .simplebar-scrollbar:before{top:2px;bottom:2px}.simplebar-track.simplebar-horizontal{left:0;height:11px}.simplebar-track.simplebar-horizontal .simplebar-scrollbar:before{height:100%;left:2px;right:2px}.simplebar-track.simplebar-horizontal .simplebar-scrollbar{right:auto;left:0;top:2px;height:7px;min-height:0;min-width:10px;width:auto}[data-simplebar-direction=rtl] .simplebar-track.simplebar-vertical{right:auto;left:0}.hs-dummy-scrollbar-size{direction:rtl;position:fixed;opacity:0;visibility:hidden;height:500px;width:500px;overflow-y:hidden;overflow-x:scroll}.simplebar-hide-scrollbar{position:fixed;left:0;visibility:hidden;overflow-y:scroll;scrollbar-width:none;-ms-overflow-style:none}";
  document.head.appendChild(simpleBarStyle);

  const nouiSliderStyle = document.createElement('style');
  nouiSliderStyle.textContent =
    '.noUi-target,.noUi-target *{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;-ms-touch-action:none;touch-action:none;-ms-user-select:none;-moz-user-select:none;user-select:none;-moz-box-sizing:border-box;box-sizing:border-box}.noUi-target{position:relative}.noUi-base,.noUi-connects{width:100%;height:100%;position:relative;z-index:1}.noUi-connects{overflow:hidden;z-index:0}.noUi-connect,.noUi-origin{will-change:transform;position:absolute;z-index:1;top:0;right:0;-ms-transform-origin:0 0;-webkit-transform-origin:0 0;-webkit-transform-style:preserve-3d;transform-origin:0 0;transform-style:flat}.noUi-connect{height:100%;width:100%}.noUi-origin{height:10%;width:10%}.noUi-txt-dir-rtl.noUi-horizontal .noUi-origin{left:0;right:auto}.noUi-vertical .noUi-origin{width:0}.noUi-horizontal .noUi-origin{height:0}.noUi-handle{-webkit-backface-visibility:hidden;backface-visibility:hidden;position:absolute}.noUi-touch-area{height:100%;width:100%}.noUi-state-tap .noUi-connect,.noUi-state-tap .noUi-origin{-webkit-transition:transform .3s;transition:transform .3s}.noUi-state-drag *{cursor:inherit!important}.noUi-horizontal{height:18px}.noUi-horizontal .noUi-handle{width:34px;height:28px;right:-17px;top:-6px}.noUi-vertical{width:18px}.noUi-vertical .noUi-handle{width:28px;height:34px;right:-6px;top:-17px}.noUi-txt-dir-rtl.noUi-horizontal .noUi-handle{left:-17px;right:auto}.noUi-target{background:#FAFAFA;border-radius:4px;border:1px solid #D3D3D3;box-shadow:inset 0 1px 1px #F0F0F0,0 3px 6px -5px #BBB}.noUi-connects{border-radius:3px}.noUi-connect{background:#3FB8AF}.noUi-draggable{cursor:ew-resize}.noUi-vertical .noUi-draggable{cursor:ns-resize}.noUi-handle{border:1px solid #D9D9D9;border-radius:3px;background:#FFF;cursor:default;box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #EBEBEB,0 3px 6px -3px #BBB}.noUi-active{box-shadow:inset 0 0 1px #FFF,inset 0 1px 7px #DDD,0 3px 6px -3px #BBB}.noUi-handle:after,.noUi-handle:before{content:"";display:block;position:absolute;height:14px;width:1px;background:#E8E7E6;left:14px;top:6px}.noUi-handle:after{left:17px}.noUi-vertical .noUi-handle:after,.noUi-vertical .noUi-handle:before{width:14px;height:1px;left:6px;top:14px}.noUi-vertical .noUi-handle:after{top:17px}[disabled] .noUi-connect{background:#B8B8B8}[disabled] .noUi-handle,[disabled].noUi-handle,[disabled].noUi-target{cursor:not-allowed}.noUi-pips,.noUi-pips *{-moz-box-sizing:border-box;box-sizing:border-box}.noUi-pips{position:absolute;color:#999}.noUi-value{position:absolute;white-space:nowrap;text-align:center}.noUi-value-sub{color:#ccc;font-size:10px}.noUi-marker{position:absolute;background:#CCC}.noUi-marker-sub{background:#AAA}.noUi-marker-large{background:#AAA}.noUi-pips-horizontal{padding:10px 0;height:80px;top:100%;left:0;width:100%}.noUi-value-horizontal{-webkit-transform:translate(-50%,50%);transform:translate(-50%,50%)}.noUi-rtl .noUi-value-horizontal{-webkit-transform:translate(50%,50%);transform:translate(50%,50%)}.noUi-marker-horizontal.noUi-marker{margin-left:-1px;width:2px;height:5px}.noUi-marker-horizontal.noUi-marker-sub{height:10px}.noUi-marker-horizontal.noUi-marker-large{height:15px}.noUi-pips-vertical{padding:0 10px;height:100%;top:0;left:100%}.noUi-value-vertical{-webkit-transform:translate(0,-50%);transform:translate(0,-50%);padding-left:25px}.noUi-rtl .noUi-value-vertical{-webkit-transform:translate(0,50%);transform:translate(0,50%)}.noUi-marker-vertical.noUi-marker{width:5px;height:2px;margin-top:-1px}.noUi-marker-vertical.noUi-marker-sub{width:10px}.noUi-marker-vertical.noUi-marker-large{width:15px}.noUi-tooltip{display:block;position:absolute;border:1px solid #D9D9D9;border-radius:3px;background:#fff;color:#000;padding:5px;text-align:center;white-space:nowrap}.noUi-horizontal .noUi-tooltip{-webkit-transform:translate(-50%,0);transform:translate(-50%,0);left:50%;bottom:120%}.noUi-vertical .noUi-tooltip{-webkit-transform:translate(0,-50%);transform:translate(0,-50%);top:50%;right:120%}.noUi-horizontal .noUi-origin>.noUi-tooltip{-webkit-transform:translate(50%,0);transform:translate(50%,0);left:auto;bottom:10px}.noUi-vertical .noUi-origin>.noUi-tooltip{-webkit-transform:translate(0,-18px);transform:translate(0,-18px);top:auto;right:28px}';
  document.head.appendChild(nouiSliderStyle);

  const customStyle = document.createElement('style');
  customStyle.textContent = `
    .injected_by_extension input[type=radio] {   
      margin-right: 4px;
      position: relative;
      top: 1px;
    }

    .injected_by_extension input[type=radio], 
    .injected_by_extension input[type=radio] + label {   
      cursor: pointer;
    }

    .noUi-horizontal .noUi-handle {
      width: 18px;
    }
    
    .noUi-horizontal .noUi-handle::before {
      left: 10px;
    }

    .noUi-horizontal .noUi-handle::after {
      left: 5px;
    }

    .noUi-tooltip {
      padding: 0;
      bottom: 40% !important;
      min-height: 26px;
      z-index: 999;
    }

    .custom-tooltip {
      font-size: 11px;
      line-height: 10px;
      padding: 3px 2px 0px;
    }

    .custom-tooltip-title {
      font-weight: bold;
    }

    .custom-tooltip-value {
      line-height: 21px;
    }

    .custom-tooltip-curr {
      font-weight: bold;
      line-height: 21px;
      animation: flash linear .3s alternate;
    }

    .ui-panel.injected-by-extension.warning-mode {
      background-color: #6f1e21;
      animation: flash linear 1s infinite;
    }

    @keyframes flash {
      0% { opacity: 1; } 
      50% { opacity: .3; } 
      100% { opacity: 1; }
    }

    .popup-overlay {
      background: #1b262d;
    }
  `;
  document.head.appendChild(customStyle);
})();
