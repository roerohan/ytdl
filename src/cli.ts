import commander, { Command } from 'commander';

import logger from './utils/logger';
import VideoData from './videoData';
import downloader from './downloader';
import dumpJson from './utils/jsonDump';

function setOptions(program: commander.Command) {
    program
        .option('-i, --info <url>', 'info about YouTube link')
        .option('-d, --download <url>', 'download from YouTube link')
        .option('-fn, --filename <filename>', 'filename of downloaded content')
        .option('-q, --quality <quality>', 'quality of downloaded content')
        .option('-dj, --dump-json <url>', 'dump json into file')
        .option('-ao, --audio-only', 'download only audio stream')
        .option('-vo, --video-only', 'download only video stream');
}

async function parseOptions(program: commander.Command) {
    if (program.download) {
        const {
            videoInfo,
        } = await VideoData.fromLink(program.download);

        const filename = program.filename || 'ytdl.mp4';
        const options = {
            audioOnly: !!program.audioOnly,
            videoOnly: !!program.videoOnly,
        };

        let quality = '360p';
        if (options.audioOnly) {
            quality = 'any';
        }

        quality = program.quality || quality;
        // TODO: download by itag

        downloader(videoInfo, quality, filename, options);
    }

    if (program.info) {
        const {
            videoId,
            videoTitle,
            videoTime,
            videoDescription,
        } = await VideoData.fromLink(program.info);
        logger.info(`Video ID: ${videoId}`);
        logger.info(`Video Title: ${videoTitle}`);
        logger.info(`Video Time: ${videoTime} seconds`);
        logger.info(`Video Description:\n ${videoDescription}`);
    }

    if (program.dumpJson) {
        const {
            videoInfo,
        } = await VideoData.fromLink(program.dumpJson);

        const filename = program.filename || 'dump.json';
        dumpJson(videoInfo, filename);
    }
}

async function cli(args: string[]) {
    const program = new Command();
    program.version('0.0.1');

    setOptions(program);
    program.parse(args);
    await parseOptions(program);
}

export = {
    cli,
};
