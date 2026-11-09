import React from 'react';
import toast from 'react-hot-toast';

/**
 * Branded confirmation toast that matches the Nyumbangin design system.
 * Resolves to `true` when confirmed and `false` when cancelled / dismissed.
 */
export function confirmToast({
  title,
  description,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  danger = false,
  duration = 10000,
}) {
  return new Promise((resolve) => {
    let toastId;
    let autoDismiss;
    let settled = false;

    const settle = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(autoDismiss);
      if (toastId) toast.dismiss(toastId);
      resolve(value);
    };

    toastId = toast(
      (t) => (
        <div className="flex flex-col gap-3 max-w-sm">
          <div>
            <p className="text-sm font-extrabold text-[#2d2d2d]">{title}</p>
            {description ? (
              <p className="mt-1 text-xs font-medium leading-relaxed text-[#696057]">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                settle(false);
              }}
              className="rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-3.5 py-1.5 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#f2e4d4] cursor-pointer active:translate-y-0.5"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                settle(true);
              }}
              className={`rounded-xl border-2 border-[#2d2d2d] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-[2px_2px_0px_#2d2d2d] transition cursor-pointer active:translate-y-0.5 ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2d2d2d] hover:bg-black'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );

    autoDismiss = setTimeout(() => settle(false), duration);
  });
}

export default confirmToast;
