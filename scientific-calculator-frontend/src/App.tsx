import React, { useState, useRef, useEffect } from "react";
import "./App.css";

interface CalculateResponse {
    success: boolean;
    result?: string;
    error?: string;
}

interface HistoryItem {
    id: number;
    expression: string;
    result: string;
}

const App: React.FC = () => {
    const [expression, setExpression] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setEditingId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCalculate = async (expression: string) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    expression,
                }),
            });

            const data: CalculateResponse = await response.json();

            if (data.success) {
                setHistory(prevHistory => [
                    { id: Date.now(), expression, result: data.result || "" },
                    ...prevHistory
                ]);
                setExpression("");
                setError(null);
            } else {
                setError(data.error || "An unknown error occurred.");
            }
        } catch (err) {
            setError("Error connecting to the server.");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id?: number) => {
        if (e.key === "Enter") {
            if (id) {
                const item = history.find(h => h.id === id);
                if (item) {
                    handleCalculate(item.expression);
                    setEditingId(null);
                }
            } else {
                handleCalculate(expression);
            }
        } else if (e.key === "Escape" && id) {
            setEditingId(null);
        }
    };

    const handleHistoryItemClick = (id: number) => {
        setEditingId(id);
    };

    const handleHistoryItemChange = (id: number, newExpression: string) => {
        setHistory(prevHistory =>
            prevHistory.map(item =>
                item.id === id ? { ...item, expression: newExpression } : item
            )
        );
    };

    return (
        <div className="calculator-container" ref={containerRef}>
            <div className="calculator-history">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="history-item"
                        onClick={() => handleHistoryItemClick(item.id)}
                    >
                        {editingId === item.id ? (
                            <input
                                type="text"
                                className="history-input"
                                value={item.expression}
                                onChange={(e) => handleHistoryItemChange(item.id, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, item.id)}
                                autoFocus
                            />
                        ) : (
                            <div className="history-content">
                                <span className="history-expression">{item.expression}</span>
                                <span className="history-result">= {item.result}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <input
                ref={inputRef}
                type="text"
                className="calculator-input"
                placeholder="Enter your expression..."
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
            />
            {error && (
                <div className="calculator-error">{error}</div>
            )}
        </div>
    );
};

export default App;

