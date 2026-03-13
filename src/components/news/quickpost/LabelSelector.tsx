import { useState, useEffect } from "react";
import { X, Plus, Settings2, Save, RotateCcw } from "lucide-react";

const DEFAULT_LABELS = [
  "জাতীয়", "আন্তর্জাতিক", "রাজনীতি", "অর্থনীতি", "খেলাধুলা",
  "বিনোদন", "তথ্যপ্রযুক্তি", "শিক্ষা", "স্বাস্থ্য", "লাইফস্টাইল",
  "মতামত", "ব্রেকিং", "ভিডিও", "ফটো গ্যালারি", "দেশ-বাংলা",
];

const STORAGE_KEY = "quickpost-custom-labels";

interface LabelSelectorProps {
  selectedLabels: string[];
  setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function LabelSelector({ selectedLabels, setSelectedLabels }: LabelSelectorProps) {
  const [customLabel, setCustomLabel] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [savedLabels, setSavedLabels] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_LABELS;
    } catch {
      return DEFAULT_LABELS;
    }
  });
  const [editableLabels, setEditableLabels] = useState<string[]>(savedLabels);
  const [newLabelInput, setNewLabelInput] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLabels));
  }, [savedLabels]);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const addCustomLabel = () => {
    const trimmed = customLabel.trim();
    if (trimmed && !selectedLabels.includes(trimmed)) {
      setSelectedLabels((prev) => [...prev, trimmed]);
      setCustomLabel("");
    }
  };

  // Edit mode functions
  const removeEditableLabel = (label: string) => {
    setEditableLabels((prev) => prev.filter((l) => l !== label));
  };

  const addEditableLabel = () => {
    const trimmed = newLabelInput.trim();
    if (trimmed && !editableLabels.includes(trimmed)) {
      setEditableLabels((prev) => [...prev, trimmed]);
      setNewLabelInput("");
    }
  };

  const saveLabels = () => {
    setSavedLabels(editableLabels);
    setEditMode(false);
  };

  const resetLabels = () => {
    setEditableLabels(DEFAULT_LABELS);
  };

  const cancelEdit = () => {
    setEditableLabels(savedLabels);
    setEditMode(false);
  };

  return (
    <div className="bg-card rounded shadow-sm p-6 mb-4">
      <div className="flex items-center justify-between mb-4 border-b-2 border-primary pb-2">
        <h2 className="text-sm font-bold text-foreground">
          ক্যাটাগরি / লেবেল সিলেক্ট করুন
        </h2>
        <button
          onClick={() => {
            if (editMode) cancelEdit();
            else { setEditableLabels(savedLabels); setEditMode(true); }
          }}
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {editMode ? "বাতিল" : "কাস্টমাইজ"}
        </button>
      </div>

      {editMode ? (
        /* Edit Mode */
        <div>
          <p className="text-xs text-muted-foreground mb-3">লেবেল যোগ/মুছে কাস্টমাইজ করুন। সেভ করলে এগুলো ফিক্সড থাকবে।</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {editableLabels.map((label) => (
              <span
                key={label}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border flex items-center gap-1.5"
              >
                {label}
                <button
                  onClick={() => removeEditableLabel(label)}
                  className="text-destructive hover:text-destructive/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newLabelInput}
              onChange={(e) => setNewLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEditableLabel()}
              placeholder="নতুন লেবেল লিখুন..."
              className="flex-1 bg-muted border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              onClick={addEditableLabel}
              disabled={!newLabelInput.trim()}
              className="bg-accent text-accent-foreground px-3 py-2 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              যোগ
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveLabels}
              className="bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              সেভ করুন
            </button>
            <button
              onClick={resetLabels}
              className="bg-muted text-muted-foreground px-4 py-2 rounded text-xs font-semibold hover:text-foreground flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ডিফল্ট
            </button>
          </div>
        </div>
      ) : (
        /* Normal Mode */
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {savedLabels.map((label) => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedLabels.includes(label)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomLabel()}
              placeholder="কাস্টম লেবেল লিখুন..."
              className="flex-1 bg-muted border border-border rounded px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              onClick={addCustomLabel}
              disabled={!customLabel.trim()}
              className="bg-accent text-accent-foreground px-4 py-2 rounded text-xs font-semibold hover:opacity-90 disabled:opacity-50"
            >
              যোগ করুন
            </button>
          </div>
          {selectedLabels.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              সিলেক্টেড: <span className="text-foreground font-semibold">{selectedLabels.join(", ")}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
