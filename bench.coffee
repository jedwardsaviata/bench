#!/usr/bin/env coffee

fs = require 'fs'
path = require 'path'

P = require 'bluebird'
meter = require 'stream-meter'
numeral = require 'numeral'
durations = require 'durations'
prettyBytes = require 'pretty-bytes'

truncate = P.promisify(fs.truncate)
inFile = path.resolve '/dev/zero'
outFile = path.resolve 'content.dat'
maxBytes = 1 * 1024 * 1024 * 1024

# Run the benchmark
benchmark = ->
  new P (resolve, reject) ->
    truncate outFile
    .catch (error) ->
      console.error "Could no truncate #{outFile}: #{error.message}"
    .finally ->
      watch = durations.stopwatch()
      m = meter maxBytes
      input = fs.createReadStream inFile
      output = fs.createWriteStream outFile

      report = ->
        bps = prettyBytes(m.bytes / watch.duration().seconds())
        bytesPretty = numeral(m.bytes).format('0,0')
        bytesHuman = prettyBytes(m.bytes)
        console.log "#{bytesPretty} bytes (#{bytesHuman}) written in #{watch} : #{bps}/s"
      reporterId = setInterval report, 1000

      m.on 'error', (error) ->
        console.log "Reading from #{inFile}"
        console.log "Writing to #{outFile}"
        console.log "Forwarded #{maxBytes} bytes"
        clearInterval reporterId
        report()
        resolve()

      watch.start()
      input.pipe(m).pipe(output)

# The timing wrapper function
runBenchmark = (next) ->
  benchmark()
  .catch (error) ->
    console.error "Error running benchmark:", error
  .finally -> next()

# Time the benchmark
durations.timeAsync runBenchmark, (duration) ->
  console.log "Benchmark run took #{duration}"

