#!/usr/bin/env bash

set -e -u
set -o pipefail

env
pwd
cmd=
while getopts 'c:' optname
do
    case $optname in
      c)
        echo "c) $OPTARG"
        cmd=$OPTARG;;
    esac
done

if [ ! $cmd ]; then
  cmd=${ci_cmd-'build'}
fi

echo '设置 Mirrors'
# npm config set registry http://mirrors.cloud.tencent.com/npm/
yarn config set registry  http://mirrors.cloud.tencent.com/npm/

yarn config list
# rm yarn.lock
echo yarn --verbose
yarn
echo "yarn $cmd"
yarn $cmd
