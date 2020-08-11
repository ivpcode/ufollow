import $ from "jquery";
import md5 from "js-md5";

function BlobUploader(UploadAuth, Blob, ChunkSize, RetriesOnError) {
	var This = this;

	if (UploadAuth == null || Blob == null) {
		console.error("Not valid BlobUploader params.");
		return null;
	}

	if (UploadAuth.Token == null)
		UploadAuth.Token = UploadAuth.UploadToken;

	// PRIVATE VARIABLES
	if (!ChunkSize || typeof ChunkSize != "number")
		ChunkSize = 2;
	var CHUNK_SIZE = ChunkSize * 1024 * 1024; // 2Mb

	if (!RetriesOnError || typeof RetriesOnError != "number")
		RetriesOnError = 3;

	var events = {
		"onprogress": null // (progress, uploadedSize, totalSize)
	};

	var DefCurrentUpload = null;
	var dtStartTime;
	var XHRUpload = null;

	var iTotalChunksCount = 0;
	var iTotalUploadedSize = 0;
	var iCurrentChunkUploadedAmount = 0;
	var iCurrentChunkSize = 0;
	var iCurrentChunkNumber = 0;


	// PUBLIC VARIABLES
	This.Blob = Blob;
	This.IsCompleted = false;
	This.IsAborted = false;
	This.nConsecutiveErrors = 0;

	// PRIVATE FUNCTIONS
	function on(evt, callback) {
		if (evt != "" && evt != null && typeof callback == "function")
			events["on" + evt] = callback;
	}

	function off(evt) {
		if (evt != "" && evt != null)
			events["on" + evt] = null;
	}

	function CheckChunk() {
		if (This.IsAborted == true)
			return;

		if (iCurrentChunkNumber > iTotalChunksCount) {
			XHRUpload = null;
			var DeltaT = new Date() - dtStartTime;
			console.log("> Blob Upload Complete - TotalSize=" + FormatMediaSize(This.Blob.size) + " - TotalTime=" + DeltaT + "[ms] - Speed=" + ((This.Blob.size * 8.0) / DeltaT / 1000).toFixed(2) + "Mbps");
			DefCurrentUpload.resolve(UploadAuth.Token);
			return;
		}

		var iStart = (iCurrentChunkNumber - 1) * CHUNK_SIZE;
		var iEnd = iStart + CHUNK_SIZE;
		if (iEnd > This.Blob.size)
			iEnd = This.Blob.size;
		iCurrentChunkSize = iEnd - iStart;
		var curBlobPart = This.Blob.slice(iStart, iEnd);

		console.log("> Blob Chunk Check Start => ChunkNumber=" + iCurrentChunkNumber + " - ChunkSize=" + FormatMediaSize(iCurrentChunkSize));
		var ChunkStartTime = new Date();

		var buffer = curBlobPart.arrayBuffer().then(buffer => {
			var arr = new Uint8Array(buffer);
			var sMD5 = md5(arr);

			var DeltaT = (new Date().getTime() - ChunkStartTime.getTime());
			console.log("> Blob Chunk MD5 calculation => " + (DeltaT) + "ms");

			var sURL = UploadAuth.UploadURL + "?ChunkNumber=" + iCurrentChunkNumber + "&UploadToken=" + UploadAuth.Token + "&Length=" + iCurrentChunkSize + "&MD5=" + sMD5; // Sistemare questa cosa per render multipart
			var request = new XMLHttpRequest();
			request.open('GET', sURL, true);
			//request.setRequestHeader("content-type",);
			if (UploadAuth.Headers != null) {
				request.setRequestHeader("Authorization", UploadAuth.Headers.Authorization);
				request.setRequestHeader("x-amz-content-sha256", UploadAuth.Headers.XAmzContentSHA256);
				request.setRequestHeader("x-amz-date", UploadAuth.Headers.XAmzDate);
			}

			request.onreadystatechange = function () {
				if (request.readyState === 4) {
					if (request.status == 304) {
						This.nConsecutiveErrors = 0;
						var DeltaT = (new Date() - ChunkStartTime);
						console.log("> Blob Chunk Checked and Already On Server => ChunkNumber=" + iCurrentChunkNumber);
						iCurrentChunkUploadedAmount = 0;
						iTotalUploadedSize += iCurrentChunkSize;
						UpdateUploadProgress();
						iCurrentChunkNumber++;

						setTimeout(function () {
							CheckChunk();
						}, 1);
					}
					else {
						setTimeout(function () {
							UploadChunk();
						}, 1);
					}
				}
			};

			// Per le richieste di check non gestisce errori ne progress

			XHRUpload = request;

			request.send();
		});
	}

	function UploadChunk() {
		if (This.IsAborted == true)
			return;

		if (iCurrentChunkNumber > iTotalChunksCount) {
			XHRUpload = null;
			var DeltaT = new Date() - dtStartTime;
			console.log("> Blob Upload Complete - TotalSize=" + FormatMediaSize(This.Blob.size) + " - TotalTime=" + DeltaT + "[ms] - Speed=" + ((This.Blob.size * 8.0) / DeltaT / 1000).toFixed(2) + "Mbps");
			DefCurrentUpload.resolve(UploadAuth.Token);
			return;
		}

		var iStart = (iCurrentChunkNumber - 1) * CHUNK_SIZE;
		var iEnd = iStart + CHUNK_SIZE;
		if (iEnd > This.Blob.size)
			iEnd = This.Blob.size;
		iCurrentChunkSize = iEnd - iStart;
		var curBlobPart = This.Blob.slice(iStart, iEnd);

		console.log("> Blob Chunk Upload Start => ChunkNumber=" + iCurrentChunkNumber + " - ChunkSize=" + FormatMediaSize(iCurrentChunkSize));
		var ChunkStartTime = new Date();

		var buffer = curBlobPart.arrayBuffer().then(buffer => {
			var arr = new Uint8Array(buffer);
			var sMD5 = md5(arr);

			var sURL = UploadAuth.UploadURL + "?ChunkNumber=" + iCurrentChunkNumber + "&UploadToken=" + UploadAuth.Token + "&MD5=" + sMD5; // Sistemare questa cosa per render multipart
			var request = new XMLHttpRequest();
			request.open('PUT', sURL, true);
			request.contentLength = This.Blob.size;
			//request.setRequestHeader("Access-Control-Allow-Origin", "*");
			request.setRequestHeader("content-type", This.Blob.type);
			if (UploadAuth.Headers != null) {
				request.setRequestHeader("Authorization", UploadAuth.Headers.Authorization);
				request.setRequestHeader("x-amz-content-sha256", UploadAuth.Headers.XAmzContentSHA256);
				request.setRequestHeader("x-amz-date", UploadAuth.Headers.XAmzDate);
			}

			request.onreadystatechange = function () {
				if (request.readyState === 4 && request.status == 200) {
					This.nConsecutiveErrors = 0;
					var DeltaT = (new Date() - ChunkStartTime);
					console.log("> Blob Chunk Upload Complete => ChunkNumber=" + iCurrentChunkNumber + " - UploadTime=" + DeltaT + "[ms] - Speed=" + ((iCurrentChunkSize * 8.0) / DeltaT / 1000).toFixed(2) + "Mbps");
					iCurrentChunkUploadedAmount = 0;
					iTotalUploadedSize += iCurrentChunkSize;
					UpdateUploadProgress();
					iCurrentChunkNumber++;

					setTimeout(function () {
						CheckChunk();
					}, 1);
				}
			};

			request.upload.onprogress = function (e) {
				if (e.lengthComputable) {
					iCurrentChunkUploadedAmount = e.loaded;
					UpdateUploadProgress();
				}
			};

			request.onerror = function (err) {
				This.nConsecutiveErrors++;
				if (This.nConsecutiveErrors >= RetriesOnError) {
					if (DefCurrentUpload)
						DefCurrentUpload.reject(err);
				}
				else
					setTimeout(UploadChunk, 1);
			};

			XHRUpload = request;

			request.send(curBlobPart);
		});
	}

	function UpdateUploadProgress() {
		if (This.IsAborted == true)
			return;

		// Se è stato bindato un evento lo triggero
		if (typeof events.onprogress == "function") {
			var dProgress = (iCurrentChunkUploadedAmount + iTotalUploadedSize) / This.Blob.size;
			events.onprogress(dProgress, iCurrentChunkUploadedAmount + iTotalUploadedSize, This.Blob.size);
		}
	}


	// PUBLIC FUNCTIONS
	function Start() {
		DefCurrentUpload = $.Deferred();

		// Blocco altri upload in corso
		if (XHRUpload != null)
			This.Cancel();
		This.IsCompleted = false;
		This.IsAborted = false;

		// Controlla il supporto delle api per il tipo di upload
		if ((window.File && window.FileReader && window.FileList && window.Blob && window.Blob.prototype.slice) == false)
			return DefCurrentUpload.reject("This browsers not supports needed file blob apis");

		dtStartTime = new Date();

		iCurrentChunkUploadedAmount = 0;
		iTotalUploadedSize = 0;
		UpdateUploadProgress();

		iTotalChunksCount = Math.ceil(This.Blob.size / CHUNK_SIZE);
		iCurrentChunkNumber = 1;
		CheckChunk();

		return DefCurrentUpload;
	}

	function Cancel() {
		if (XHRUpload != null) {
			try {
				XHRUpload.onreadystatechange = null;
				XHRUpload.abort();
				console.log("Upload aborted");
			} catch (e) {
				console.error(e);
			}
		}

		XHRUpload = null;
		This.IsAborted = true;
	}

	function FormatMediaSize(value) {
		var unit = "Kb";
		var ValOut = value / 1024;

		if (value / 1024 / 1024 > 1) {
			unit = "Mb";
			ValOut = value / 1024 / 1024;
		}

		if (value / 1024 / 1024 / 1024 > 1) {
			unit = "Gb";
			ValOut = value / 1024 / 1024 / 1024;
		}

		return ValOut.toFixed(1) + unit;
	}

	function GetUploadProgress() {
		let TotalBytes = This.Blob.size;
		let TotalUploaded = (iCurrentChunkUploadedAmount + iTotalUploadedSize);

		return { "Percent": (TotalUploaded / TotalBytes) * 100, "TotalBytes": TotalBytes, "TotalUploaded": TotalUploaded }
	}

	// CONSTRUCTOR
	This.on = on;
	This.off = off;
	This.Start = Start;
	This.Cancel = Cancel;
	This.FormatMediaSize = FormatMediaSize;
	This.GetUploadProgress = GetUploadProgress;

	return This;
}

export default BlobUploader;
window.BlobUploader = BlobUploader;