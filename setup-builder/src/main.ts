/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import {join} from 'path'

const defaultVersion = '0.0.2'

let silicon = false
let arch = ''

async function needsArmFlag(): Promise<boolean> {
  const uname = await exec.getExecOutput(`uname`, ['-m'])
  const isArm = uname.stdout === 'arm64'
  let isM1 = false
  try {
    // this command will only succeed on m1 macs.
    await exec.exec('arch', ['-arm64', 'echo', 'hi'])
    isM1 = true
  } catch (err) {
    // Must not be an m1 mac
  }
  return isM1 && !isArm
}

async function get(): Promise<string> {
 const version = core.getInput('version') || defaultVersion

  const toolPath = tc.find('pakket-builder', version, arch)
  // found in cache
  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`)
    return toolPath
  }

  const url = `https://core.pakket.sh/pakket-builder/${version}/pakket-builder-${version}-${arch}.tar.xz`
  core.info(`Downloading ${arch} version of pakket-builder from ${url}`)

  const downloadPath = await tc.downloadTool(url)
  const dest = await tc.extractTar(downloadPath)

  const cachedDir = await tc.cacheDir(dest, 'pakket-builder', version, arch)
  core.info(`Successfully cached pakket-builder to ${cachedDir}`)

  return cachedDir
}

async function run(): Promise<void> {
  try {
    silicon = await needsArmFlag()

    if (!silicon) {
      arch = 'amd64'
    } else {
      arch = 'arm64'
    }

    // get pakket-builder
    const path = await get()

    // add to path
    core.addPath(join(path, 'pakket-builder', 'bin'))

    core.info('setup complete!')
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
