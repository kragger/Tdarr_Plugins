"use strict";
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint-disable no-param-reassign */
var details = function () { return ({
    name: 'Start',
    description: 'Start FFmpeg Command',
    style: {
        borderColor: 'green',
    },
    tags: 'video',
    isStartPlugin: false,
    sidebarPosition: 1,
    icon: '',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    var containerParts = args.inputFileObj._id.split('.');
    var container = containerParts[containerParts.length - 1];
    var ffmpegCommand = {
        inputFiles: [],
        streams: JSON.parse(JSON.stringify(args.inputFileObj.ffProbeData.streams)).map(function (stream) { return (__assign(__assign({}, stream), { removed: false, mapArgs: [
                '-map',
                "0:".concat(stream.index),
            ], inputArgs: [], outputArgs: [] })); }),
        container: container,
        hardwareDecoding: false,
        shouldProcess: false,
        overallInputArguments: [],
        overallOuputArguments: [],
    };
    args.variables.ffmpegCommand = ffmpegCommand;
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
