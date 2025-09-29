const path = require('path');
const fs = require('fs');
const clc = require("cli-color");
const SFTP = require('../modules/sftp.cjs');

const sftpFolderPath = path.resolve(process.env.INIT_CWD, 'dist', 'sftp');

fs.access(sftpFolderPath, error => {
    if (error) {
        console.log( clc.red('Error: "dist/sftp" folder is not exist!') );
    } else {
        SFTP.upload( sftpFolderPath );        
    }
});