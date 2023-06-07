const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs-extra");

const REGEX_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/gm;

// most @actions toolkit packages have async methods
async function run() {
	try {
		const payload = github.context.payload;
		const workingDirectory = '.dist'
		let tag = payload.release.tag_name;

		if (tag.startsWith("v")) {
			tag = tag.replace("v", "")
		}

		if (!REGEX_PATTERN.test(tag)) {
			throw new Error("Release Tag does not match semantic versioning of MAJOR.MINOR.PATCH.");
		}

		const pkg = await fs.readJson(`${workingDirectory}/package.json`);
		const originalVersion = pkg.version;

		pkg.version = tag;
		await fs.outputJson(`${workingDirectory}/package.json`, pkg, {
			spaces: 2
		});

		core.info(`Modified version number in package.json from ${originalVersion.replace("v", "")} to ${pkg.version}`);
	} catch (error) {
		core.setFailed(error.message);
	}
}

run();
