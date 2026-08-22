import { useState, useEffect, useRef } from "react"
import api from "../api"
import '../App.css'


function Convert() {
  const [file, setFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState("pdf")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState("")
  const [jobStatus, setJobStatus] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    setFile(e.target.files[0])
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!file) return

    setLoading(true)

    const formData = new FormData();
    formData.append("file", file)
    formData.append("target_format", targetFormat)

    try {
      const resp = await api.post("/convert", formData)
      setResult(resp.data)
      setJobId(resp.data.job_id)
      setUploadedFileName(file.name)

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setFile(null)
    setJobId("")
    setJobStatus(null)
    setResult(null)
    setUploadedFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  useEffect(() => {

    if (!jobId) return

    const interval = setInterval(async () => {
      const resp = await api.get(`/jobs/${jobId}`)
      setJobStatus(resp.data)

      if (resp.data.status === "done" || resp.data.status === "failed") {
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)

  }, [jobId]);

  return (
    <>
      <div className="app-container">


        <div className="app-header">
          <h1>ShelfShift</h1>
          <p>Convert between EPUB , MOBI , PDF and TXT</p>
          <p>Convert various eBooks files like MOBI and EPUB to PDF.</p>
        </div>

        {jobStatus?.status !== "done" ? (
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>File</label>

                <div className="file-input-wrapper">
                  <label htmlFor="file-upload" className="file-upload-label">
                    <span className="file-upload-icon"> + </span>
                    <span>{file ? file.name : "Select file"}</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                    ref={fileInputRef}
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Convert To</label>
                <select value={targetFormat} className="select-input" onChange={(e) => setTargetFormat(e.target.value)}>
                  <option value="pdf">PDF</option>
                  <option value="epub">EPUB</option>
                  <option value="mobi">MOBI</option>
                  <option value="txt">TXT</option>
                </select>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Converting..' : 'Convert'}
              </button>
            </form>

            {jobStatus && jobStatus?.status !== "failed" && jobId && (
              <div className="status-box status-processing">
                <div className="spinner"></div>
                <span>Converting your file</span>
              </div>
            )}

            {jobStatus?.status === "failed" && (
              <div className="status-box status-failed">
                <p>{jobStatus.error_message}</p>
              </div>
            )}

          </div>
        )

          : (
            <div className="card result-card">
              <p className="result-filename">{uploadedFileName}</p>
              <p className="result-format">Converted to {targetFormat.toUpperCase()}</p>

              <a href={`${import.meta.env.VITE_API_URL}/jobs/${jobId}/download`} className="download-btn">
                Download File
              </a>

              <button onClick={handleReset} className="reset-btn">
                Start Over
              </button>
            </div>
          )
        }

        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload</h3>
              <p>Select any EPUB, MOBI, PDF, or TXT file from your device.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Convert</h3>
              <p>Pick your target format and we'll process it in seconds.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Download</h3>
              <p>Grab your converted file , ready to read anywhere.</p>
            </div>
          </div>
        </div>

      </div>





    </>
  )
}

export default Convert
