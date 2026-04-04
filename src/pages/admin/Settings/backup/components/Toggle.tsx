import { useState } from "react";

interface ToggleProps {
  defaultOn?: boolean;
}

export default function Toggle({ defaultOn = false }: ToggleProps) {
  const [on, setOn] = useState(defaultOn);

  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        on ? "bg-indigo-500" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
