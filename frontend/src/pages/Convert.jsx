import { useState, useEffect } from "react"
import api from "../api"
import '../App.css'


function Convert() {
  const [file, setFile] = useState(null)
  const [targetFormat, setTargetFormat] = useState("pdf")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState("")
  const [jobStatus, setJobStatus] = useState(null)

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

    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || "Upload failed")
    } finally {
      setLoading(false)
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
        </div>

        {jobStatus && jobStatus?.status !== "done" && jobStatus?.status !== "failed" && (
          <div className="status-box status-processing">
            <div className="spinner"></div>
            <span>Converting your file</span>
          </div>
        )}

        {jobStatus?.status === "done" && (
          <div className="status-box status-done">
            <a href={`${import.meta.env.VITE_API_URL}/jobs/${jobId}/download`} className="download-btn">Download File</a>
          </div>
        )}

        {jobStatus?.status === "failed" && (
          <div className="status-box status-failed">
            <p>{jobStatus.error_message}</p>
          </div>
        )}

            

      </div>





    </>
  )
}

export default Convert
