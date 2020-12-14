/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
function details() {
  return {
    id: 'Tdarr_Plugin_MC93_Migz2CleanTitle',
    Stage: 'Pre-processing',
    Name: 'Migz-Clean title metadata',
    Type: 'Video',
    Operation: 'Clean',
    Description: 'This plugin removes title metadata from video/audio/subtitles.\n\n',
    Version: '1.9',
    Link: 'https://github.com/HaveAGitGat/Tdarr_Plugins/blob/master/Community/Tdarr_Plugin_MC93_Migz2CleanTitle.js',
    Tags: 'pre-processing,ffmpeg,configurable',
    Inputs: [{
      name: 'clean_audio',
      tooltip: `Specify if audio titles should be checked & cleaned. Optional.
               \\nExample:\\n
               true

               \\nExample:\\n
               false`,
    },
    {
      name: 'clean_subtitles',
      tooltip: `Specify if subtitle titles should be checked & cleaned. Optional.
               \\nExample:\\n
               true

               \\nExample:\\n
               false`,
    },
    {
      name: 'custom_title_matching',
      tooltip: `If you enable audio or subtitle cleaning the plugin only looks for titles with more then 3 full stops.
                  //nThis is one way to identify junk metadata without removing real metadata that you might want.
                  //nHere you can specify your own text for it to also search for to match and remove.
                  //nComma separated. Optional.
               \\nExample:\\n
               MiNX - Small HD episodes

               \\nExample:\\n
               MiNX - Small HD episodes,GalaxyTV - small excellence!`,
    },
    ],
  };
}

function plugin(file, librarySettings, inputs) {
  const response = {
    processFile: false,
    preset: '',
    container: `.${file.container}`,
    handBrakeMode: false,
    FFmpegMode: true,
    reQueueAfter: false,
    infoLog: '',
  };

  // Set up required variables.

  let ffmpegCommandInsert = '';
  let videoIdx = 0;
  let audioIdx = 0;
  let subtitleIdx = 0;
  let convert = false;
  let custom_title_matching = '';

  // Check if inputs.custom_title_matching has been configured. If it has then set variable
  if (typeof inputs.custom_title_matching !== 'undefined') {
    custom_title_matching = inputs.custom_title_matching.toLowerCase().split(',');
  }

  // Check if file is a video. If it isn't then exit plugin.
  if (file.fileMedium !== 'video') {
    console.log('File is not video');
    response.infoLog += '☒File is not video \n';
    response.processFile = false;
    return response;
  }

  // Check if overall file metadata title is not empty, if it's not empty set to "".
  if (typeof file.meta.Title !== 'undefined') {
    try {
      ffmpegCommandInsert += ' -metadata title="" ';
      convert = true;
    } catch (err) {
      // Error
    }
  }

  // Go through each stream in the file.
  for (let i = 0; i < file.ffProbeData.streams.length; i++) {
    // Check if stream is a video.
    if (file.ffProbeData.streams[i].codec_type.toLowerCase() === 'video') {
      try {
        // Check if stream title is not empty, if it's not empty set to "".
        if (typeof file.ffProbeData.streams[i].tags.title !== 'undefined') {
          response.infoLog += `☒Video stream title is not empty. Removing title from stream ${i} \n`;
          ffmpegCommandInsert += ` -metadata:s:v:${videoIdx} title="" `;
          convert = true;
        }
        // Increment videoIdx.
        videoIdx += 1;
      } catch (err) {
        // Error
      }
    }

    // Check if title metadata of audio stream has more then 3 full stops.
    // If so then it's likely to be junk metadata so remove.
    // Then check if any audio streams match with user input custom_title_matching variable, if so then remove.
    if (
      file.ffProbeData.streams[i].codec_type.toLowerCase() === 'audio'
      && inputs.clean_audio.toLowerCase() === 'true'
    ) {
      try {
        if (typeof file.ffProbeData.streams[i].tags.title !== 'undefined') {
          if (file.ffProbeData.streams[i].tags.title.split('.').length - 1 > 3) {
            try {
              response.infoLog += `☒More then 3 full stops in audio title. Removing title from stream ${i} \n`;
              ffmpegCommandInsert += ` -metadata:s:a:${audioIdx} title="" `;
              convert = true;
            } catch (err) {
              // Error
            }
          }
          if (typeof inputs.custom_title_matching !== 'undefined') {
            try {
              if (custom_title_matching.indexOf(file.ffProbeData.streams[i].tags.title.toLowerCase()) !== -1) {
                response.infoLog += `☒Audio matched custom input. Removing title from stream ${i} \n`;
                ffmpegCommandInsert += ` -metadata:s:a:${audioIdx} title="" `;
                convert = true;
              }
            } catch (err) {
              // Error
            }
          }
        }
        // Increment audioIdx.
        audioIdx += 1;
      } catch (err) {
        // Error
      }
    }

    // Check if title metadata of subtitle stream has more then 3 full stops.
    // If so then it's likely to be junk metadata so remove.
    // Then check if any streams match with user input custom_title_matching variable, if so then remove.
    if (
      file.ffProbeData.streams[i].codec_type.toLowerCase() === 'subtitle'
      && inputs.clean_subtitles.toLowerCase() === 'true'
    ) {
      try {
        if (typeof file.ffProbeData.streams[i].tags.title !== 'undefined') {
          if (file.ffProbeData.streams[i].tags.title.split('.').length - 1 > 3) {
            try {
              response.infoLog += `☒More then 3 full stops in subtitle title. Removing title from stream ${i} \n`;
              ffmpegCommandInsert += ` -metadata:s:s:${subtitleIdx} title="" `;
              convert = true;
            } catch (err) {
              // Error
            }
          }
          if (typeof inputs.custom_title_matching !== 'undefined') {
            try {
              if (custom_title_matching.indexOf(file.ffProbeData.streams[i].tags.title.toLowerCase()) !== -1) {
                response.infoLog += `☒Subtitle matched custom input. Removing title from stream ${i} \n`;
                ffmpegCommandInsert += ` -metadata:s:s:${subtitleIdx} title="" `;
                convert = true;
              }
            } catch (err) {
              // Error
            }
          }
        }
        // Increment subtitleIdx.
        subtitleIdx += 1;
      } catch (err) {
        // Error
      }
    }
  }

  // Convert file if convert variable is set to true.
  if (convert === true) {
    response.infoLog += '☒File has title metadata. Removing \n';
    response.preset = `,${ffmpegCommandInsert} -c copy -map 0 -max_muxing_queue_size 9999`;
    response.reQueueAfter = true;
    response.processFile = true;
  } else {
    response.infoLog += '☑File has no title metadata \n';
  }
  return response;
}
module.exports.details = details;
module.exports.plugin = plugin;
