import React, { useState, useCallback } from 'react';

// --- Helper Components & Icons ---

const IconCamera = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

const IconUpload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-upload">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const Spinner = () => (
    <div className="spinner-container">
        <div className="spinner"></div>
    </div>
);

const ErrorDisplay = ({ message }) => (
    <div className="error-display">
        <strong>An error occurred:</strong>
        <span style={{ marginTop: '8px', display: 'block' }}>{message}</span>
    </div>
);

const NutritionReport = ({ data }) => {
    const { mealName, nutrition, summary } = data;
    const { calories, proteinGrams, carbsGrams, fatGrams } = nutrition;

    const macros = [
        { name: 'Protein', value: parseInt(proteinGrams) || 0, color: '#3b82f6' },
        { name: 'Carbs', value: parseInt(carbsGrams) || 0, color: '#f59e0b' },
        { name: 'Fat', value: parseInt(fatGrams) || 0, color: '#ef4444' },
    ];
    
    // 1g Protein = 4 cal, 1g Carb = 4 cal, 1g Fat = 9 cal
    const proteinCals = macros[0].value * 4;
    const carbsCals = macros[1].value * 4;
    const fatCals = macros[2].value * 9;
    const totalCals = proteinCals + carbsCals + fatCals;

    const proteinPercent = totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0;
    const carbsPercent = totalCals > 0 ? Math.round((carbsCals / totalCals) * 100) : 0;
    const fatPercent = totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0;
    
    const percentages = [
        { name: 'Protein', percent: proteinPercent, color: 'bg-blue-500' },
        { name: 'Carbs', percent: carbsPercent, color: 'bg-amber-500' },
        { name: 'Fat', percent: fatPercent, color: 'bg-red-500' },
    ];

    return (
        <div className="nutrition-report">
            <div>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Identified Meal</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>{mealName}</h3>
            </div>
            <div className="calories-box">
                <p style={{ color: '#059669', fontWeight: '600' }}>Estimated Calories</p>
                <p style={{ fontSize: '3rem', fontWeight: '800', color: '#047857', lineHeight: '1.1' }}>{calories || 'N/A'}</p>
            </div>
            <div>
                <h4 className="section-title">Macro Breakdown (by Calories)</h4>
                <div className="percentage-bar">
                    {percentages.map(macro => (
                        <div
                            key={macro.name}
                            className={`percentage-segment ${macro.color}`}
                            style={{ width: `${macro.percent}%` }}
                            title={`${macro.name}: ${macro.percent}%`}
                        ></div>
                    ))}
                </div>
                <div className="percentage-labels">
                    {percentages.map(macro => (
                        <div key={macro.name}>
                            <p style={{ fontWeight: '700', color: '#1e293b' }}>{macro.percent}%</p>
                            <p style={{ color: '#64748b' }}>{macro.name}</p>
                        </div>
                    ))}
                </div>
            </div>
             <div className="macro-grams">
                <h4 className="section-title">Macro Breakdown (by Weight)</h4>
                 <div className="grams-grid">
                    <div><strong>{proteinGrams || 0}g</strong> Protein</div>
                    <div><strong>{carbsGrams || 0}g</strong> Carbs</div>
                    <div><strong>{fatGrams || 0}g</strong> Fat</div>
                 </div>
            </div>
             <div style={{ paddingTop: '1rem' }}>
                <h4 className="section-title">AI Health Summary</h4>
                <p style={{ color: '#475569', fontSize: '0.875rem', fontStyle: 'italic' }}>"{summary}"</p>
            </div>
        </div>
    );
};

const App = () => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [nutritionalData, setNutritionalData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setNutritionalData(null);
            setErrorMessage('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const analyzeMeal = useCallback(async () => {
        if (!file) {
            setErrorMessage('Please upload an image of your meal first.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setNutritionalData(null);

        try {
            const base64ImageData = await convertFileToBase64(file);
            const apiKey = "AIzaSyB0XhCtNHpNz_ahRfVxArPTwkUAVmgXvBw"; // Canvas will provide key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
            
            const payload = {
                contents: [
                    {
                        parts: [
                            { text: "Analyze the image of this meal. Identify the food, estimate portion size, and calculate its nutritional content. Provide a breakdown of total calories, and protein, carbohydrates, and fats in grams. Also, provide a brief, one-sentence health summary. Return the data as a JSON object." },
                            {
                                inlineData: {
                                    mimeType: file.type,
                                    data: base64ImageData
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            mealName: { type: "STRING" },
                            nutrition: {
                                type: "OBJECT",
                                properties: {
                                    calories: { type: "STRING" },
                                    proteinGrams: { type: "STRING" },
                                    carbsGrams: { type: "STRING" },
                                    fatGrams: { type: "STRING" }
                                }
                            },
                            summary: { type: "STRING" }
                        }
                    }
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
                const parsedJson = JSON.parse(jsonText);
                setNutritionalData(parsedJson);
            } else {
                throw new Error("Could not analyze the meal. The AI response was empty.");
            }

        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    }, [file]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
                
                body, #root {
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                    color: #0f172a;
                    margin: 0;
                    min-width: 100%;
                }
                
                .app-container {
                    max-width: 1024px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                
                header {
                    text-align: center;
                    margin-bottom: 3rem;
                }
                
                header .icon-container {
                    display: flex;
                    justify-content: center;
                    color: #059669;
                    margin-bottom: 1rem;
                }
                
                header h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                
                header p {
                    color: #475569;
                    margin-top: 1rem;
                    font-size: 1.125rem;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .main-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2.5rem;
                }
                
                @media (min-width: 1024px) {
                    .main-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
                
                .card {
                    background-color: white;
                    padding: 2rem;
                    border-radius: 24px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    border: 1px solid #e2e8f0;
                }
                
                .card h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }
                
                .upload-box {
                    border: 2px dashed #cbd5e1;
                    border-radius: 16px;
                    padding: 2rem;
                    text-align: center;
                    background-color: #f8fafc;
                }
                
                .upload-label {
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 12px;
                    color: white;
                    background-color: #059669;
                    transition: all 0.3s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .upload-label:hover {
                    background-color: #047857;
                }
                
                .upload-label.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .file-support-text {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin-top: 1rem;
                }
                
                .preview-container {
                    margin-top: 2rem;
                }
                
                .preview-container h3 {
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 0.75rem;
                }
                
                .preview-image {
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                
                .preview-image img {
                    width: 100%;
                    height: 256px;
                    object-fit: cover;
                    background-color: #f1f5f9;
                }
                
                .analyze-button {
                    width: 100%;
                    background-color: #059669;
                    color: white;
                    font-weight: 700;
                    padding: 1rem;
                    border-radius: 12px;
                    font-size: 1.125rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-top: 2.5rem;
                    box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.3);
                }
                
                .analyze-button:hover {
                    background-color: #047857;
                }
                
                .analyze-button:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                
                .results-placeholder {
                    text-align: center;
                    color: #64748b;
                    padding-top: 6rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                
                .spinner-container {
                    padding: 6rem 0;
                    display: flex;
                    justify-content: center;
                }
                
                .spinner {
                    animation: spin 1s linear infinite;
                    border-radius: 50%;
                    width: 4rem;
                    height: 4rem;
                    border-bottom: 4px solid #10b981;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .error-display {
                    padding: 1rem 1.5rem;
                    border-radius: 16px;
                    font-weight: 600;
                    background-color: #fee2e2;
                    color: #991b1b;
                    border: 1px solid #fca5a5;
                }
                
                .icon {
                    width: 2.5rem;
                    height: 2.5rem;
                }
                
                .icon-upload {
                    width: 1.25rem;
                    height: 1.25rem;
                    margin-right: 0.75rem;
                }
                
                .nutrition-report {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .calories-box {
                    background-color: #d1fae5;
                    padding: 1.5rem;
                    border-radius: 16px;
                    text-align: center;
                }
                
                .section-title {
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 0.75rem;
                }
                
                .percentage-bar {
                    width: 100%;
                    background-color: #e5e7eb;
                    border-radius: 999px;
                    height: 1.25rem;
                    display: flex;
                    overflow: hidden;
                }
                
                .percentage-segment {
                    transition: all 0.5s;
                }
                
                .percentage-labels {
                    margin-top: 0.75rem;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    text-align: center;
                    font-size: 0.875rem;
                }

                .macro-grams {
                    padding-top: 1rem;
                    border-top: 1px solid #e2e8f0;
                }
                
                .grams-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    text-align: center;
                    font-size: 1rem;
                    color: #475569;
                }

                .grams-grid strong {
                    color: #1e293b;
                    font-weight: 700;
                }

                .bg-blue-500 { background-color: #3b82f6; }
                .bg-amber-500 { background-color: #f59e0b; }
                .bg-red-500 { background-color: #ef4444; }
                
            `}</style>
            <div className="app-container">
                <header>
                    <div className="icon-container">
                        <IconCamera />
                    </div>
                    <h1>Meal Nutrition Analyzer</h1>
                    <p>
                        Snap a picture of your meal, and let AI generate a nutritional report for you.
                    </p>
                </header>

                <main className="main-grid">
                    {/* Left Column: Upload */}
                    <div className="card">
                        <h2>1. Upload Meal Photo</h2>
                        <div className="upload-box">
                            <input
                                type="file"
                                id="file-upload"
                                style={{ display: 'none' }}
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                            <label htmlFor="file-upload" className={`upload-label ${isLoading ? 'disabled' : ''}`}>
                                <IconUpload />
                                {file ? 'Change Photo' : 'Select a Photo'}
                            </label>
                            <p className="file-support-text">PNG, JPG, or WEBP files supported.</p>
                        </div>

                        {previewUrl && (
                            <div className="preview-container">
                                <h3>Meal Preview:</h3>
                                <div className="preview-image">
                                    <img src={previewUrl} alt="Meal preview" />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <button
                                onClick={analyzeMeal}
                                disabled={!file || isLoading}
                                className="analyze-button"
                            >
                                {isLoading ? 'Analyzing...' : '2. Analyze Nutrition'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Results */}
                    <div className="card">
                        <h2>2. Nutrition Report</h2>
                        <div style={{ minHeight: '400px' }}>
                            {isLoading && <Spinner />}
                            {errorMessage && <ErrorDisplay message={errorMessage} />}
                            {nutritionalData && !isLoading && <NutritionReport data={nutritionalData} />}

                            {!isLoading && !errorMessage && !nutritionalData && (
                                <div className="results-placeholder">
                                    <p>Your nutrition report will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default App;
