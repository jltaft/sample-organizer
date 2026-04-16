window.onload = init;

num_li = 11;
waveInterval = null;
let inputLine = {buffer: new Uint8Array(128)};

window.electron.loadSettings().then((settings) => {
	const skin = settings.skin || 'default';
	applySkin(skin);
	
	const skinSelector = document.getElementById('skinSelector');
  	if (skinSelector) {
    	skinSelector.value = skin;
  	}
});

function applySkin(skinName) {
	document.getElementById('theme-css').href = `skins/${skinName}.css`;
}

function onSkinSelect(newSkin) {
	applySkin(newSkin);
	window.electron.saveSettings({ skin: newSkin });
}

function init() {
	//globals that need to load after app loads
	input = document.getElementById("upload");
	switch_mode = document.getElementById("switch_mode");
	submit = document.getElementById("submit");
	submit_single = document.getElementById("submit_single");
	right_onload = document.getElementById("right_onload");
	right = document.getElementById("right");
	left = document.getElementById("left");
	left2 = document.getElementById("left2");
	fileInput = document.getElementById("upload");
	fileName = document.getElementById("fileName");
	epsilon = document.getElementById("epsilon_select");
	destination = document.getElementById("destination");
	fileInput.addEventListener("change", update);
	submit.addEventListener("click", pass);
	switch_mode.addEventListener("click", toggle_mode);
	submit_single.addEventListener("click", pass_single);
	canvas = document.getElementById('spectrogram_disp');
	ctx = canvas.getContext('2d');
	epsilon.addEventListener("input", () => {
            document.getElementById("epsilon_value").textContent = `${epsilon.value}%`;
	});
}

function toggle_mode() {
	//going from normal to analyze
	if (left2.classList.contains("hidden")) {
		left.classList.add("hidden");
		left2.classList.remove("hidden");
	}
	//going from analyze back to normal
	else {
		left2.classList.add("hidden");
		left.classList.remove("hidden");
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function start_loading() {
	const maxDashes = 16;
	let phase = 0;
	const submit_container = document.getElementsByClassName('fileUpload');
	submit_container[0].classList.add("hidden");
	waveInterval = setInterval(() => {
		for (let i = 0; i < 12; i++) {
			const element = document.getElementById(i);
			const height = Math.round((Math.sin((i + phase) * 0.5) + 1) / 2 * maxDashes);
			element.textContent = '-'.repeat(height + 2);
		}
		phase++;
	}, 50);
}

async function stop_loading() {
	clearInterval(waveInterval);
	for (let i = 0; i < 12; i++) {
		await sleep(150);
		const element = document.getElementById(i);
		if (element) {
			element.textContent = 'DONE';
		}
	}
	const submit_container = document.getElementsByClassName('fileUpload');
	submit_container[0].classList.remove("hidden");
}

function update() {
	//updates file names on the right side
	console.log("files updated");
	fileName.textContent = this.files.length > 0 ? this.files.length + " files" : "no files chosen";
	const intro = document.getElementById("right_onload");
	intro.classList.add("hidden");
	const right2 = document.getElementById("right2");
	right2.classList.add("hidden");
	const file_list = document.getElementById("right");
	file_list.classList.remove("hidden");
	document.getElementById("00").textContent = input.files[0].name;
	for (var i = (num_li > (input.files.length - 1)) ? (input.files.length - 1) : num_li; i >= 0; i--) {
		const li = document.getElementById(i);
		li.textContent = input.files[i].name;
	}
	for (var i = input.files.length; i <= num_li; i++) {
		const li = document.getElementById(i);
		li.textContent = "";
	}
	const li = document.getElementById(num_li);
	if (input.files.length > num_li) {
		li.textContent = input.files.length - num_li + " more files";
	}
	else {
		li.textContent = "";
	}
}

function pass() {
	console.log("passing to python");
	//pass epsilon, destination, filepath, then list of file names to be analyzed
	let path_str = window.electron.getFilePath(input.files[0]);
	let path = path_str.split("/");
	path_str = '';
	let x = 0;;
	while (x < path.length - 1) {
		path_str += path[x] + "/";
		x++;
	}

	const names = Array.from(input.files).map(file => file.name);
	const data = {
		epsilon: parseFloat(epsilon.value),
		files: names,
		path: path_str
	};
	//fetch passes JSON to python server over network port 8080
	start_loading();
	fetch('http://localhost:8080/data', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data)
	})
	.then(() => {
		//end loading animation
		stop_loading();
		console.log('data sent');
	})
}

function pass_single() {
	let path_str = window.electron.getFilePath(input.files[0]);
	console.log(path_str);
	const data = {
		file: path_str
	}
	fetch('http://localhost:8080/features', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data)
	})
	.then(response => {
		return response.json();
	})
	.then(result => {
		const right = document.getElementById("right");
		right.classList.add("hidden");
		const right2 = document.getElementById("right2");
		right2.classList.remove("hidden");
		document.getElementById("01").textContent = "spectral features"
		let fts = result["spectral_features"].map(num => Math.round(num * 100) / 100);
		let duration = fts[0] > 3 ? String(`${Math.round(fts[0] * 100) / 100}s`) : String(`${(Math.round(fts[0] * 100) / 100) * 1000}ms`);
		document.getElementById("02").textContent = `zero crossing rate: ${fts[1]}`
		document.getElementById("03").textContent = `duration: ${duration}`  
		document.getElementById("04").textContent = `centroid: ${fts[2]}`
		document.getElementById("05").textContent = `rolloff: ${fts[3]}`
		document.getElementById("06").textContent = `flatness ${fts[4]}`
		document.getElementById("07").textContent = `contrast: ${fts[5]}`
		document.getElementById("08").textContent = `bandwidth: ${fts[6]}`
		document.getElementById("09").textContent = `sample rate: ${result["sample_rate"]}`
		document.getElementById("010").textContent = "spectrogram"
		spect_arr = result["spectrogram"]
		const rasterscan = new Rasterscan(inputLine, canvas.height, canvas.width, "right", {
  			lineRate: 10
		});
		const internalCanvas = rasterscan.offScreenCvs;
		rasterscan.start();
		let j = 0;
		setInterval(() => {
			inputLine.buffer.set(spect_arr[j]);
			draw(rasterscan);
			j++;
		}, 100);
	})
}

function draw(rasterscan) {
	//copies the offscreen canvas made by rasterscan onto our canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(rasterscan.offScreenCvs,
	0, 0, canvas.width, canvas.height,
	0, 0, canvas.width, canvas.height);
}
