#!/usr/bin/env sh

set -eu

REPO_URL="https://github.com/kawasin73/legacygl.js.git"
REPO_DIR="./legacygl.js"
DEST_DIR="./public/lib"
DEST="${DEST_DIR}/legacygl.js"
FILES="boundingbox.js camera.js colormap.js drawutil.js gl-matrix.js \
    gl-matrix-util.js glu.js halfedge.js legacygl.js meshio.js \
    numeric-1.2.6.js numeric-util.js util.js"

#
# download legacygl.js
#
if [ ! -d ${REPO_DIR} ]; then
    git clone ${REPO_URL} ${REPO_DIR}
fi

#
# combine legacygl.js into 1 file
#

# create library dir
mkdir -p ${DEST_DIR}

# remove library file if exists
if [ -e ${DEST} ]; then
    echo "remove dest file ${DEST}"
    rm ${DEST}
fi

echo "combine each file to legacygl.js"

# add file header
echo "// ====================================================" >> ${DEST}
echo "// legacygl.js"                                          >> ${DEST}
echo "// Copy From https://bitbucket.org/kenshi84/legacygl.js" >> ${DEST}
echo "// ====================================================" >> ${DEST}

for pathname in ${FILES}; do

    echo "combine ${pathname}"

    # append header to file
    echo ""                                                        >> ${DEST}
    echo "// ====================================================" >> ${DEST}
    echo "// filename: ${pathname}"                                >> ${DEST}
    echo "// ====================================================" >> ${DEST}

    # append source code
    cat "${REPO_DIR}/${pathname}" >> ${DEST}
done

echo "created dest file ${DEST}"
