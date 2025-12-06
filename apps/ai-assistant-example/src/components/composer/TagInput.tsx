import React from 'react';

type TagInputProps = {
  tags: string[];
  placeholder?: string;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
};

export const TagInput: React.FC<TagInputProps> = ({ tags, placeholder, onAdd, onRemove }) => {
  const [input, setInput] = React.useState('');

  const handleAdd = React.useCallback(() => {
    const value = input.trim();
    if (!value) return;
    if (tags.includes(value)) {
      setInput('');
      return;
    }
    onAdd(value);
    setInput('');
  }, [input, tags, onAdd]);

  const handleRemove = React.useCallback(
    (tag: string) => {
      onRemove(tag);
    },
    [onRemove]
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  return (
    <div className="assistant-tag-input">
      <div className="assistant-tags">
        {tags.map((tag) => (
          <span key={tag} className="assistant-tag">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => handleRemove(tag)}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="assistant-tag-row">
        <input
          className="assistant-tag-input__field"
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          type="text"
          inputMode="text"
          enterKeyHint="done"
          aria-label="Add a tag"
        />
        <button type="button" className="assistant-tag-input__add" onClick={handleAdd} aria-label="Add tag">
          + Add
        </button>
      </div>
    </div>
  );
};
