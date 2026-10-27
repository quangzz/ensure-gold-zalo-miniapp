let jobIdPromise: Promise<string | null> | null = null;
let currentJobId: string | null = null; // Always null on init to force new session

const getUrlParams = () => {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

const initJobId = async () => {
  if (currentJobId) return currentJobId;
  if (jobIdPromise) return jobIdPromise;

  jobIdPromise = (async () => {
    try {
      const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      if (!localStorage.getItem('sessionId')) {
        localStorage.setItem('sessionId', sessionId);
      }

      const meta = getUrlParams();
      console.log('[Tracking] Initializing session via status check with meta:', meta);
      
      const response = await fetch(`https://linhx.info/api/ensureMiniApp/submit_tracking.php?action=status&session_id=${sessionId}&meta=${encodeURIComponent(JSON.stringify(meta))}`);

      const responseText = await response.text();
      if (!response.ok) {
        console.error(`[Tracking] Status/Init HTTP Error: ${response.status}`, responseText);
        throw new Error(`Init HTTP Error: ${response.status}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('[Tracking] Failed to parse Init JSON response:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (result.success && result.job_id) {
        currentJobId = result.job_id;
        localStorage.setItem('currentJobId', currentJobId!);
        console.log(`%c[Tracking] Folder Created & ID Established: ${currentJobId}`, "color: #00ff00; font-weight: bold; background-color: #000; padding: 2px 5px;");
        return currentJobId;
      } else {
        console.error('[Tracking] Server failed to initialize job directory:', result);
        throw new Error('Directory initialization failed');
      }
    } catch (error) {
      console.error('[Tracking] Session initialization failed:', error);
      jobIdPromise = null; 
      return null;
    }
  })();

  return jobIdPromise;
};

export const trackEvent = async (eventType: string, extraData: Record<string, any> = {}) => {
  try {
    const jobId = await initJobId();
    if (!jobId) return null;
    
    const sessionId = localStorage.getItem('sessionId');
    const payload = {
      event_type: eventType,
      session_id: sessionId,
      job_id: jobId,
      timestamp: Date.now(),
      url: window.location.href,
      ...extraData,
    };

    console.log(`[Tracking] Sending event: ${eventType}`, payload);

    // Convert payload to query string for consistency with status check
    const queryParams = new URLSearchParams(payload as any).toString();
    const response = await fetch(`https://linhx.info/api/ensureMiniApp/submit_tracking.php?action=track&${queryParams}`, {
        method: 'GET' // Changed to GET to align with simple query param usage
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`[Tracking] Event HTTP Error: ${response.status}`, responseText);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseErr) {
      console.error(`[Tracking] Failed to parse Event JSON response for ${eventType}:`, responseText);
      throw new Error('Invalid JSON response from server');
    }

    console.log(`[Tracking] Server response for ${eventType}:`, result);
    return result;
  } catch (error) {
    console.error(`[Tracking] Failed to send event ${eventType}:`, error);
    return null;
  }
};
