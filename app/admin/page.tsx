"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [selectedSport, setSelectedSport] = useState("football");
  const [uploadType, setUploadType] = useState<"schedule" | "roster" | "image" | "info">("schedule");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields for sport info
  const [headCoach, setHeadCoach] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [programDescription, setProgramDescription] = useState("");

  const sports = [
    { value: "football", label: "Football" },
    { value: "boys-basketball", label: "Boys Basketball" },
    { value: "girls-basketball", label: "Girls Basketball" },
    { value: "boys-soccer", label: "Boys Soccer" },
    { value: "girls-soccer", label: "Girls Soccer" },
    { value: "field-hockey", label: "Field Hockey" },
    { value: "baseball", label: "Baseball" },
    { value: "softball", label: "Softball" },
    { value: "volleyball", label: "Volleyball" },
    { value: "track-field", label: "Track & Field" },
    { value: "boys-wrestling", label: "Boys Wrestling" },
    { value: "girls-wrestling", label: "Girls Wrestling" },
    { value: "lacrosse", label: "Lacrosse" },
    { value: "cross-country", label: "Cross Country" },
    { value: "swimming", label: "Swimming" },
  ];

  // Load existing sport info when sport changes
  useEffect(() => {
    const loadSportInfo = async () => {
      try {
        const response = await fetch('/api/sports');
        const result = await response.json();
        
        if (result.success && result.data[selectedSport]) {
          setHeadCoach(result.data[selectedSport].coach || "");
          setCoachEmail(result.data[selectedSport].coachEmail || "");
          setProgramDescription(result.data[selectedSport].description || "");
        } else {
          // Reset if no data
          setHeadCoach("");
          setCoachEmail("");
          setProgramDescription("");
        }
      } catch (error) {
        console.error('Error loading sport info:', error);
      }
    };

    if (uploadType === "info") {
      loadSportInfo();
    }
  }, [selectedSport, uploadType]);

  const handleSportInfoSubmit = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/sports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: selectedSport,
          type: 'info',
          data: {
            coach: headCoach,
            coachEmail: coachEmail,
            description: programDescription,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Success! Sport information updated for ${selectedSport}.`);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`❌ Error updating sport information.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage("");

    if (uploadType === "image") {
      // Handle image upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sport', selectedSport);

      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setMessage(`✅ Success! Image uploaded for ${selectedSport}. The sport page will use this image now!`);
        } else {
          setMessage(`❌ Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage(`❌ Error uploading image. Please try again.`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle CSV upload (schedule/roster)
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").map(row => row.split(","));
        
        // Remove header row
        const data = rows.slice(1).filter(row => row.length > 1 && row[0].trim() !== "");

        let parsedData;
        if (uploadType === "schedule") {
          parsedData = data.map(row => ({
            date: row[0]?.trim() || "",
            opponent: row[1]?.trim() || "",
            homeAway: row[2]?.trim() || "",
            eventType: row[3]?.trim() || "",
            time: row[4]?.trim() || "",
          }));
        } else {
          parsedData = data.map(row => ({
            number: row[0]?.trim() || "",
            name: row[1]?.trim() || "",
            position: row[2]?.trim() || "",
            year: row[3]?.trim() || "",
          }));
        }

        // Save to API
        const response = await fetch('/api/sports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sport: selectedSport,
            type: uploadType,
            data: parsedData,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setMessage(`✅ Success! ${uploadType === "schedule" ? "Schedule" : "Roster"} saved with ${parsedData.length} entries. The sport page will update automatically!`);
        } else {
          setMessage(`❌ Error: ${result.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage(`❌ Error processing file. Please check the format and try again.`);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-900 text-white shadow-lg">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <img src="/lchs-banner-logo.png" alt="LCHS Logo" className="h-12" />
              <span className="text-2xl font-bold">Admin Panel</span>
            </Link>
            <Link href="/" className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded transition">
              Back to Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Update Sports Information</h1>
          
          {/* Sport Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-gray-700">Select Sport</label>
            <select 
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800"
              disabled={isLoading}
            >
              {sports.map(sport => (
                <option key={sport.value} value={sport.value}>{sport.label}</option>
              ))}
            </select>
          </div>

          {/* Upload Type Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-gray-700">Update Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setUploadType("schedule")}
                disabled={isLoading}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  uploadType === "schedule" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Schedule
              </button>
              <button
                onClick={() => setUploadType("roster")}
                disabled={isLoading}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  uploadType === "roster" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Roster
              </button>
              <button
                onClick={() => setUploadType("image")}
                disabled={isLoading}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  uploadType === "image" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Image
              </button>
              <button
                onClick={() => setUploadType("info")}
                disabled={isLoading}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  uploadType === "info" 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Info
              </button>
            </div>
          </div>

          {/* Sport Info Form */}
          {uploadType === "info" ? (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded mb-6">
                <h3 className="font-semibold text-purple-900 mb-2">Update Sport Information:</h3>
                <p className="text-sm text-purple-800">
                  Update the head coach name, contact email, and program description for this sport.
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Head Coach Name</label>
                <input
                  type="text"
                  value={headCoach}
                  onChange={(e) => setHeadCoach(e.target.value)}
                  placeholder="e.g., John Smith"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Coach Email</label>
                <input
                  type="email"
                  value={coachEmail}
                  onChange={(e) => setCoachEmail(e.target.value)}
                  placeholder="e.g., coach@lchsyes.org"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">About the Program</label>
                <textarea
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                  placeholder="Describe the program, achievements, traditions, etc."
                  rows={6}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-800"
                />
              </div>

              <button
                onClick={handleSportInfoSubmit}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition ${
                  isLoading 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {isLoading ? "Saving..." : "Save Sport Information"}
              </button>
            </div>
          ) : (
            <>
              {/* Format Instructions */}
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
                <h3 className="font-semibold text-purple-900 mb-2">
                  {uploadType === "image" ? "Image Upload:" : "CSV Format Required:"}
                </h3>
                {uploadType === "schedule" ? (
                  <div className="text-sm text-purple-800">
                    <p className="mb-2">Your CSV should have these columns (with header row):</p>
                    <code className="block bg-white p-2 rounded text-xs">
                      Date,Opponent,HomeAway,EventType,Time<br/>
                      Sep 5 2026,Manheim Central,Home,League,7:00 PM<br/>
                      Sep 12 2026,L-S High School,Away,Non-League,7:00 PM<br/>
                      Sep 19 2026,Garden Spot,Home,Tournament,6:00 PM
                    </code>
                  </div>
                ) : uploadType === "roster" ? (
                  <div className="text-sm text-purple-800">
                    <p className="mb-2">Your CSV should have these columns (with header row):</p>
                    <code className="block bg-white p-2 rounded text-xs">
                      Number,Name,Position,Year<br/>
                      12,John Doe,QB,Senior<br/>
                      24,Mike Smith,RB,Junior
                    </code>
                  </div>
                ) : (
                  <div className="text-sm text-purple-800">
                    <p className="mb-2">Upload a hero image for the sport page:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Recommended size: 1920x600 pixels or larger</li>
                      <li>Accepted formats: JPG, PNG, WEBP</li>
                      <li>Keep file size under 5MB for best performance</li>
                      <li>Image will be used as the background on the sport page</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  {uploadType === "image" ? "Upload Image File" : "Upload CSV File"}
                </label>
                <input
                  type="file"
                  accept={uploadType === "image" ? "image/jpeg,image/jpg,image/png,image/webp" : ".csv"}
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-600 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {uploadType === "image" ? "Uploading image..." : uploadType === "info" ? "Saving information..." : "Processing and saving..."}
            </div>
          )}

          {/* Success/Error Message */}
          {message && !isLoading && (
            <div className={`p-4 rounded-lg ${
              message.startsWith("✅") 
                ? "bg-green-50 border border-green-200 text-green-800" 
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              {message}
            </div>
          )}

          {/* Instructions */}
          {uploadType !== "info" && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">How to Use:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Select the sport you want to update</li>
                <li>Choose what you want to upload (Schedule, Roster, Image, or Info)</li>
                {uploadType === "image" ? (
                  <>
                    <li>Click "Choose File" and select your sport image</li>
                    <li>Wait for the upload to complete</li>
                    <li>Visit the sport page to see the new hero image!</li>
                  </>
                ) : (
                  <>
                    <li>Export from Arbiter as CSV (make sure format matches above)</li>
                    <li>Click "Choose File" and select your CSV</li>
                    <li>Wait for the success message</li>
                    <li>Visit the sport page to see your updates!</li>
                  </>
                )}
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Lancaster Catholic Athletics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}