import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

async function checkPackageVersion() {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const localVersion = packageJson.version;

    const remoteVersionCommand = 'git show origin/main:package.json';
    const remotePackageJsonContent = await executeCommand(remoteVersionCommand);
    const remoteVersion = JSON.parse(remotePackageJsonContent).version;

    if (localVersion === remoteVersion) {
        console.error(`Error: The version in package.json (${localVersion}) is the same as the remote.`);
        process.exit(1);
    } else {
        console.log('Version check passed. Local version is different from remote.');
    }
}

checkPackageVersion().catch((error) => {
    console.error(`Error during version check: ${error.message}`);
    process.exit(1);
});
