import * as fs from 'fs';
import * as path from 'path';


const removeReadonlyModifiers = (dir: string): void => {
    fs.readdir(dir, (err: NodeJS.ErrnoException | null, files: string[]): void => {
        if (err) {
            console.error('Could not list the directory.', err);
            process.exit(1);
        }

        files.forEach((file: string): void => {
            const filePath: string = path.join(dir, file);

            fs.stat(filePath, (error: NodeJS.ErrnoException | null, stat: fs.Stats) => {
                if (error) {
                    console.error('Error stating file.', error);
                    return;
                }

                if (stat.isFile() && filePath.endsWith('.ts')) {
                    fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
                        if (err) {
                            console.error('Error reading file contents.', err);
                            return;
                        }

                        const result: string = data.replace(/\breadonly\b/g, '');

                        fs.writeFile(filePath, result, 'utf8', (err: NodeJS.ErrnoException | null) => {
                            if (err) {
                                console.error('Error writing modified file.', err);
                            } else {
                                console.log(`Processed file: ${filePath}`);
                            }
                        });
                    });
                } else if (stat.isDirectory()) {
                    removeReadonlyModifiers(filePath);
                }
            });
        });
    });
};

removeReadonlyModifiers( __dirname);
