import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  CalendarDays,
  TrendingUp,
  BookOpen,
  RefreshCw,
  QrCode,
  Camera,
  CameraOff,
  MapPin,
} from "lucide-react";

import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

import Card from "../../components/ui/Card";

import {
  getStudentAttendanceSummary,
  getMyAttendance,
  scanAttendanceQR,
} from "../../services/attendanceService";

function Attendance() {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);

  const [overall, setOverall] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // QR SCANNER STATES
  // =========================================================

  const [scannerRunning, setScannerRunning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [scanError, setScanError] = useState("");
  const [processingScan, setProcessingScan] = useState(false);

  const scannerRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const startingScannerRef = useRef(false);
  const scanHandledRef = useRef(false);

  // =========================================================
  // LOCATION STATES
  // =========================================================

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryData, historyData] = await Promise.all([
        getStudentAttendanceSummary(),
        getMyAttendance(),
      ]);

      console.log("Student Attendance Summary:", summaryData);
      console.log("Student Attendance History:", historyData);

      setSubjects(summaryData?.subjects || []);

      setOverall({
        total: summaryData?.overall?.total || 0,
        present: summaryData?.overall?.present || 0,
        absent: summaryData?.overall?.absent || 0,
        late: summaryData?.overall?.late || 0,
        percentage: summaryData?.overall?.percentage || 0,
      });

      setStudent(
        historyData?.student ||
        summaryData?.student ||
        null
      );

      setHistory(historyData?.records || []);
    } catch (err) {
      console.error("Attendance loading error:", err);

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Unable to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAttendance();

    return () => {
      if (
        scannerRef.current &&
        scannerStartedRef.current
      ) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => { });
      }
    };
  }, []);

  // =========================================================
  // GET STUDENT LOCATION
  // =========================================================

  const getStudentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const message =
          "Geolocation is not supported by this browser.";

        setLocationError(message);
        reject(new Error(message));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        // =====================================================
        // SUCCESS
        // =====================================================
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          console.log(
            "GPS SUCCESS:",
            latitude,
            longitude,
            "Accuracy:",
            accuracy
          );

          resolve({
            latitude,
            longitude,
            accuracy,
          });
        },

        // =====================================================
        // ERROR
        // =====================================================
        (error) => {
          console.error(
            "GPS ERROR:",
            error.code,
            error.message
          );

          let message =
            "Unable to determine your location.";

          if (error.code === 1) {
            message =
              "Location permission was denied. Please allow location access.";
          } else if (error.code === 2) {
            message =
              "Your current location could not be determined.";
          } else if (error.code === 3) {
            message =
              "Location request timed out. Please try again.";
          }

          setLocationError(message);
          reject(new Error(message));
        },

        // =====================================================
        // OPTIONS
        // =====================================================
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );
    });
  };

  // =========================================================
  // REFRESH CURRENT LOCATION
  // =========================================================

  const refreshCurrentLocation = async () => {
    if (locationLoading) {
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    try {
      const location =
        await getStudentLocation();

      setCurrentLocation(location);

      console.log(
        "Location successfully received:",
        location
      );
    } catch (err) {
      console.error(
        "Unable to get current location:",
        err
      );

      setLocationError(
        err?.message ||
        "Unable to determine your current location."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // =========================================================
  // STOP QR SCANNER
  // =========================================================

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        if (scannerStartedRef.current) {
          await scannerRef.current.stop();
        }

        try {
          await scannerRef.current.clear();
        } catch (clearError) {
          console.warn(
            "Scanner clear warning:",
            clearError
          );
        }
      }
    } catch (err) {
      console.error(
        "Error stopping QR scanner:",
        err
      );
    } finally {
      scannerStartedRef.current = false;
      startingScannerRef.current = false;
      scannerRef.current = null;

      setScannerRunning(false);
    }
  };

  // =========================================================
  // HANDLE QR SCAN
  // =========================================================

  const handleQRScan = async (decodedText) => {
    if (
      processingScan ||
      scanHandledRef.current
    ) {
      return;
    }

    scanHandledRef.current = true;

    setProcessingScan(true);
    setScanError("");

    setScanMessage(
      "QR detected. Checking your location..."
    );

    try {
      // Stop scanner immediately after QR detection
      await stopScanner();

      // Get fresh student location
      setLocationLoading(true);
      setLocationError("");

      const location =
        await getStudentLocation();

      setCurrentLocation(location);
      setLocationLoading(false);

      console.log(
        "Student GPS:",
        location
      );

      console.log(
        "QR Token:",
        decodedText
      );

      setScanMessage(
        "Location received. Marking your attendance..."
      );

      // Send real GPS coordinates to backend
      const response =
        await scanAttendanceQR(
          decodedText,
          location.latitude,
          location.longitude
        );

      console.log(
        "QR Attendance Response:",
        response
      );

      setScanMessage(
        response?.message ||
        "Attendance marked successfully!"
      );

      // Refresh attendance data
      await loadAttendance();
    } catch (err) {
      console.error(
        "QR attendance error:",
        err
      );

      setLocationLoading(false);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Unable to mark attendance.";

      setScanMessage("");
      setScanError(message);
    } finally {
      setProcessingScan(false);
    }
  };

  // =========================================================
  // START QR SCANNER
  // =========================================================

  const startScanner = async () => {
    if (
      scannerStartedRef.current ||
      startingScannerRef.current ||
      processingScan
    ) {
      return;
    }

    startingScannerRef.current = true;
    scanHandledRef.current = false;

    setScanError("");
    setScanMessage("");
    setLocationError("");

    try {
      // Show scanner container first
      setScannerRunning(true);

      // Give React time to render scanner element
      await new Promise((resolve) =>
        setTimeout(resolve, 150)
      );

      const element =
        document.getElementById(
          "student-qr-reader"
        );

      if (!element) {
        throw new Error(
          "QR scanner container was not found."
        );
      }

      // =====================================================
      // START WITH REAR / BACK CAMERA
      // =====================================================

      console.log(
        "Requesting rear/environment camera..."
      );

      const scanner =
        new Html5Qrcode(
          "student-qr-reader"
        );

      scannerRef.current = scanner;

      // =====================================================
      // FIND AND SELECT REAR / BACK CAMERA
      // =====================================================

      const cameras =
        await Html5Qrcode.getCameras();

      console.log(
        "AVAILABLE CAMERAS:",
        cameras
      );

      if (
        !cameras ||
        cameras.length === 0
      ) {
        throw new Error(
          "No camera found on this device."
        );
      }

      const rearCamera =
        cameras.find((camera) =>
          /back|rear|environment|world|main/i.test(
            camera.label
          )
        ) ||
        cameras[cameras.length - 1];

      console.log(
        "SELECTED REAR CAMERA:",
        rearCamera
      );

      // =====================================================
      // START NORMAL SCANNER
      // =====================================================

      await scanner.start(
        rearCamera.id,
        {
          fps: 15,

          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const smallestSide = Math.min(
              viewfinderWidth,
              viewfinderHeight
            );

            const size = Math.floor(
              smallestSide * 0.70
            );

            return {
              width: size,
              height: size,
            };
          },

          aspectRatio: 1,

          disableFlip: false,

          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
          ],

          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true,
          },
        },

        async (decodedText) => {
          console.log(
            "================================="
          );

          console.log(
            "QR CODE DETECTED!"
          );

          console.log(
            "DECODED QR TEXT:",
            decodedText
          );

          console.log(
            "================================="
          );

          await handleQRScan(
            decodedText
          );
        },

        (errorMessage) => {
          // html5-qrcode sends many normal
          // frame errors while scanning.
          // These are not actual scanner failures.
          console.log(
            "QR SCANNER FRAME:",
            errorMessage
          );
        }
      );

      scannerStartedRef.current = true;

      console.log(
        "Rear camera scanner started successfully."
      );

      // =====================================================
      // GET LOCATION WHILE SCANNER IS OPEN
      // =====================================================

      refreshCurrentLocation();
    } catch (err) {
      console.error(
        "Unable to start QR scanner:",
        err
      );

      /*
       * If environment camera fails, try using
       * available camera IDs as a fallback.
       */

      try {
        console.log(
          "Trying camera ID fallback..."
        );

        if (scannerRef.current) {
          try {
            if (
              scannerStartedRef.current
            ) {
              await scannerRef.current.stop();
            }
          } catch { }

          try {
            await scannerRef.current.clear();
          } catch { }
        }

        const cameras =
          await Html5Qrcode.getCameras();

        if (
          !cameras ||
          cameras.length === 0
        ) {
          throw new Error(
            "No camera was found on this device."
          );
        }

        console.log(
          "Available cameras:",
          cameras
        );

        // Prefer cameras whose label suggests rear camera
        let selectedCamera =
          cameras.find((camera) => {
            const label =
              camera.label?.toLowerCase() ||
              "";

            return (
              label.includes("back") ||
              label.includes("rear") ||
              label.includes("environment") ||
              label.includes("main")
            );
          });

        // Otherwise use the last camera.
        // On many phones the rear camera appears later
        // in the camera list.
        if (!selectedCamera) {
          selectedCamera =
            cameras[cameras.length - 1];
        }

        console.log(
          "Fallback selected camera:",
          selectedCamera
        );

        const fallbackScanner =
          new Html5Qrcode(
            "student-qr-reader"
          );

        scannerRef.current =
          fallbackScanner;

        await fallbackScanner.start(
          selectedCamera.id,

          {
            fps: 15,

            qrbox: (
              viewfinderWidth,
              viewfinderHeight
            ) => {
              const smallestSide = Math.min(
                viewfinderWidth,
                viewfinderHeight
              );

              const size = Math.floor(
                smallestSide * 0.70
              );

              return {
                width: size,
                height: size,
              };
            },

            aspectRatio: 1,

            disableFlip: false,

            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
            ],

            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          },

          async (decodedText) => {
            console.log(
              "================================="
            );

            console.log(
              "QR CODE DETECTED! (FALLBACK)"
            );

            console.log(
              "DECODED QR TEXT:",
              decodedText
            );

            console.log(
              "================================="
            );

            await handleQRScan(
              decodedText
            );
          },

          (errorMessage) => {
            console.log(
              "QR FALLBACK SCAN FRAME:",
              errorMessage
            );
          }
        );

        scannerStartedRef.current =
          true;

        console.log(
          "Fallback camera started successfully."
        );

        refreshCurrentLocation();
      } catch (fallbackError) {
        console.error(
          "Camera fallback failed:",
          fallbackError
        );

        scannerStartedRef.current =
          false;

        scannerRef.current = null;

        setScannerRunning(false);

        let message =
          "Unable to access camera. Please allow camera permission and try again.";

        const combinedMessage =
          `${err?.message || ""} ${fallbackError?.message || ""
            }`.toLowerCase();

        if (
          combinedMessage.includes(
            "permission"
          ) ||
          combinedMessage.includes(
            "notallowed"
          )
        ) {
          message =
            "Camera permission was denied. Please allow camera access for this website and try again.";
        }

        setScanError(message);
      }
    } finally {
      startingScannerRef.current = false;
    }
  };

  // =========================================================
  // RETRY SCANNER
  // =========================================================

  const retryScanner = async () => {
    scanHandledRef.current = false;

    setScanError("");
    setScanMessage("");

    await startScanner();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw
            size={20}
            className="animate-spin"
          />

          <span>
            Loading attendance...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            My Attendance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View your attendance and mark
            attendance using QR code.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAttendance}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =====================================================
          COMPACT QR ATTENDANCE CARD
      ===================================================== */}

      <Card>
        <div className="flex flex-col gap-4">
          {/* Header */}

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <QrCode size={21} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900">
                  Mark Attendance
                </h2>

                <p className="text-xs text-gray-500">
                  Scan your faculty's QR code
                </p>
              </div>
            </div>

            {!scannerRunning &&
              !processingScan && (
                <button
                  type="button"
                  onClick={startScanner}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Camera size={16} />

                  <span>
                    Scan QR
                  </span>
                </button>
              )}

            {scannerRunning && (
              <button
                type="button"
                onClick={stopScanner}
                disabled={processingScan}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CameraOff size={16} />

                <span>
                  Stop
                </span>
              </button>
            )}
          </div>

          {/* =================================================
              SCANNER
          ================================================= */}

          <div
            className={
              scannerRunning
                ? "block"
                : "hidden"
            }
          >
            <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-xl border border-gray-200 bg-black">
              <div
                id="student-qr-reader"
                className="w-full"
              />
            </div>

            {/* Location notice */}

            <div className="mx-auto mt-3 flex w-full max-w-[400px] items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <MapPin
                size={15}
                className="shrink-0"
              />

              <span>
                Your location must be within
                the college attendance area.
              </span>
            </div>

            {/* =================================================
                CURRENT GPS LOCATION
            ================================================= */}

            <div className="mx-auto mt-3 w-full max-w-[400px] rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin
                    size={16}
                    className="text-indigo-600"
                  />

                  <span className="text-sm font-semibold text-gray-800">
                    Current GPS Location
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    refreshCurrentLocation
                  }
                  disabled={locationLoading}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={
                      locationLoading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>
              </div>

              {locationLoading && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />

                  <span>
                    Getting your GPS location...
                  </span>
                </div>
              )}

              {!locationLoading &&
                currentLocation && (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">
                        Latitude
                      </span>

                      <span className="font-medium text-gray-900">
                        {currentLocation.latitude.toFixed(
                          7
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">
                        Longitude
                      </span>

                      <span className="font-medium text-gray-900">
                        {currentLocation.longitude.toFixed(
                          7
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">
                        Accuracy
                      </span>

                      <span className="font-medium text-gray-900">
                        ±
                        {Math.round(
                          currentLocation.accuracy
                        )}{" "}
                        meters
                      </span>
                    </div>
                  </div>
                )}

              {!locationLoading &&
                !currentLocation &&
                !locationError && (
                  <p className="text-xs text-gray-500">
                    Waiting for your location...
                  </p>
                )}

              {locationError && (
                <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                  {locationError}
                </div>
              )}
            </div>

            {/* =================================================
                TEST LOCATION INFORMATION
            ================================================= */}

            {currentLocation && (
              <div className="mx-auto mt-3 w-full max-w-[400px] rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-xs font-semibold text-yellow-800">
                  TEST LOCATION
                </p>

                <p className="mt-1 text-xs leading-5 text-yellow-700">
                  These are the real GPS coordinates
                  reported by your phone. We can
                  temporarily use these coordinates
                  as the backend attendance location
                  for testing.
                </p>

                <div className="mt-2 rounded-lg bg-white p-2 font-mono text-[11px] text-gray-700">
                  <div>
                    LAT:{" "}
                    {currentLocation.latitude.toFixed(
                      7
                    )}
                  </div>

                  <div>
                    LNG:{" "}
                    {currentLocation.longitude.toFixed(
                      7
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              PROCESSING
          ================================================= */}

          {processingScan && (
            <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
              <RefreshCw
                size={16}
                className="animate-spin"
              />

              <span>
                {scanMessage ||
                  "Processing attendance..."}
              </span>
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {!processingScan &&
            scanMessage && (
              <div className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {scanMessage}
                </span>
              </div>
            )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {scanError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2 text-sm text-red-700">
                <XCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {scanError}
                </span>
              </div>

              {!scannerRunning &&
                !processingScan && (
                  <button
                    type="button"
                    onClick={retryScanner}
                    className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
                  >
                    Try again
                  </button>
                )}
            </div>
          )}
        </div>
      </Card>

      {/* =====================================================
          OVERALL ATTENDANCE
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Classes
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overall.total}
              </p>
            </div>
          </div>
        </Card>

        {/* Present */}

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Present
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overall.present}
              </p>
            </div>
          </div>
        </Card>

        {/* Absent */}

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <XCircle size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Absent
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overall.absent}
              </p>
            </div>
          </div>
        </Card>

        {/* Percentage */}

        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp size={21} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Attendance
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {overall.percentage}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* =====================================================
          SUBJECT-WISE ATTENDANCE
      ===================================================== */}

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <BookOpen size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subject-wise Attendance
            </h2>

            <p className="text-sm text-gray-500">
              Attendance details for each subject
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
            No subject attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">
                    Subject
                  </th>

                  <th className="px-4 py-3">
                    Semester
                  </th>

                  <th className="px-4 py-3">
                    Classes
                  </th>

                  <th className="px-4 py-3">
                    Present
                  </th>

                  <th className="px-4 py-3">
                    Absent
                  </th>

                  <th className="px-4 py-3">
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {subjects.map(
                  (subject, index) => (
                    <tr
                      key={
                        subject?.subject?.id ||
                        index
                      }
                      className="text-sm text-gray-700"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {subject?.subject
                              ?.name ||
                              "—"}
                          </p>

                          <p className="text-xs text-gray-500">
                            {subject?.subject
                              ?.code ||
                              "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {subject?.subject
                          ?.semester ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {subject?.total || 0}
                      </td>

                      <td className="px-4 py-4 font-medium text-green-600">
                        {subject?.present || 0}
                      </td>

                      <td className="px-4 py-4 font-medium text-red-600">
                        {subject?.absent || 0}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${Number(
                            subject?.percentage ||
                            0
                          ) >= 75
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {subject?.percentage ||
                            0}
                          %
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* =====================================================
          ATTENDANCE HISTORY
      ===================================================== */}

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Clock3 size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Attendance History
            </h2>

            <p className="text-sm text-gray-500">
              Your previous attendance records
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-500">
            No attendance history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">
                    Date
                  </th>

                  <th className="px-4 py-3">
                    Subject
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {history.map(
                  (record, index) => {
                    const status =
                      record?.status ||
                      "—";

                    const subjectName =
                      record?.subject
                        ?.name ||
                      record?.subject_name ||
                      "—";

                    return (
                      <tr
                        key={
                          record?.id ||
                          index
                        }
                        className="text-sm text-gray-700"
                      >
                        <td className="px-4 py-4">
                          {record?.date ||
                            "—"}
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {
                                subjectName
                              }
                            </p>

                            {record?.subject
                              ?.code && (
                                <p className="text-xs text-gray-500">
                                  {
                                    record
                                      .subject
                                      .code
                                  }
                                </p>
                              )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status ===
                              "Present"
                              ? "bg-green-100 text-green-700"
                              : status ===
                                "Absent"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {status ===
                              "Present" && (
                                <CheckCircle2
                                  size={13}
                                />
                              )}

                            {status ===
                              "Absent" && (
                                <XCircle
                                  size={13}
                                />
                              )}

                            {status ===
                              "Late" && (
                                <Clock3
                                  size={13}
                                />
                              )}

                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Attendance;