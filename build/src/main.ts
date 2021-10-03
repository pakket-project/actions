/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    const path = core.getInput("path", { required: true })

    exec.getExecOutput("pakket-builder", ["build", "path", "version", "-o pkg+ver"])
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
