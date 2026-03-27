(function () {
  if (document.getElementById('wipBadge')) return;

  const style = document.createElement('style');
  style.textContent = `
    .wip-badge {
      position: fixed;
      bottom: 28px;
      right: 28px;
      background: linear-gradient(135deg, rgba(229, 57, 53, 0.96) 0%, rgba(198, 40, 40, 0.96) 100%);
      color: #fff;
      padding: 16px 26px;
      border-radius: 999px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(229, 57, 53, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 9999;
      transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
      animation: wipPulse 3s ease-in-out infinite;
      max-width: min(calc(100vw - 32px), 420px);
    }

    .wip-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(229, 57, 53, 0.42), 0 0 0 1px rgba(255, 255, 255, 0.16) inset;
    }

    .wip-badge--hidden {
      opacity: 0;
      transform: translateY(18px) scale(0.94);
      pointer-events: none;
    }

    .wip-badge__dot {
      width: 10px;
      height: 10px;
      background: #4ade80;
      border-radius: 50%;
      flex-shrink: 0;
      animation: wipDotPulse 2s ease-in-out infinite;
    }

    .wip-badge__text {
      line-height: 1.2;
      white-space: nowrap;
    }

    .wip-badge__close {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      font-size: 15px;
      line-height: 1;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .wip-badge__close:hover {
      background: rgba(255, 255, 255, 0.24);
      transform: rotate(90deg);
    }

    @keyframes wipPulse {
      0%, 100% {
        box-shadow: 0 10px 30px rgba(229, 57, 53, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
      }
      50% {
        box-shadow: 0 12px 34px rgba(229, 57, 53, 0.44), 0 0 0 2px rgba(255, 255, 255, 0.14) inset, 0 0 20px rgba(229, 57, 53, 0.16);
      }
    }

    @keyframes wipDotPulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.75;
        transform: scale(1.15);
      }
    }

    @media (max-width: 640px) {
      .wip-badge {
        left: 50%;
        right: auto;
        bottom: 18px;
        transform: translateX(-50%);
        padding: 15px 20px;
        font-size: 13px;
        gap: 10px;
        width: calc(100vw - 24px);
        max-width: 360px;
      }

      .wip-badge:hover {
        transform: translateX(-50%) translateY(-2px);
      }

      .wip-badge--hidden {
        transform: translateX(-50%) translateY(18px) scale(0.94);
      }

      .wip-badge__text {
        white-space: normal;
      }
    }
  `;

  document.head.appendChild(style);

  const badge = document.createElement('div');
  badge.className = 'wip-badge';
  badge.id = 'wipBadge';
  badge.setAttribute('role', 'status');
  badge.setAttribute('aria-label', 'Website maintenance in progress');
  badge.innerHTML = `
    <span class="wip-badge__dot"></span>
    <span class="wip-badge__text">Website Maintenance in Progress</span>
    <button class="wip-badge__close" type="button" aria-label="Dismiss notification">&times;</button>
  `;

  if (localStorage.getItem('wipBadgeDismissed')) {
    badge.classList.add('wip-badge--hidden');
  }

  badge.querySelector('.wip-badge__close').addEventListener('click', function () {
    badge.classList.add('wip-badge--hidden');
    localStorage.setItem('wipBadgeDismissed', 'true');
    localStorage.setItem('wipBadgeDismissedTime', Date.now().toString());
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(badge);
  });
})();
