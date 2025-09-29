const fs = require('fs');
const path = require('path');
const clc = require('cli-color');
const prompt = require('prompt-sync')({
	autocomplete: complete(['yes', 'no']),
	sigint: false
});

if (process.argv.length === 2) {
	console.log(clc.red('Expected at argument!!!'));
	process.exit(1);
}

const templateFolder = process.argv[2];
const copiedFolderPath = path.resolve(__dirname, '..', '..', 'playables', '#blanks', templateFolder);
const workFolderPath = process.env.INIT_CWD;

let answer = prompt(clc.yellow(`Do you want to copy ${templateFolder}? [yes/no]: `)).toLowerCase();

if (answer === 'yes' || answer === 'y') {
	fs.cp(copiedFolderPath, workFolderPath, { recursive: true }, (err) => {
		if (err) {
			console.error(clc.red(`Error copying ${templateFolder}: ${err.message}`));
			process.exit(1);
		} else {
			console.log(clc.green(`Successfully copied ${templateFolder} template`));
		}
	});
} else {
	console.log(clc.red('Declined'));
}

function complete(commands) {
	return function(str) {
		return commands.filter(cmd => cmd.indexOf(str) === 0);
	};
}
