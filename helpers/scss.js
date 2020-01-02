import { src } from 'gulp'
import path from 'path'
import gulpIf from 'gulp-if'
import sass from 'gulp-sass'
import rename from 'gulp-rename'
import multiDest from 'gulp-multi-dest'
import logger from 'gulp-logger'
import plumber from 'gulp-plumber'
import notify from 'gulp-notify'
import sourcemaps from 'gulp-sourcemaps'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
import postcss from 'gulp-postcss'
import aliases from 'gulp-style-aliases';

import configLoader from '../helpers/config-loader'
import sassError from './sass-error'
import { env, themes, tempPath, projectPath, browserSyncInstances } from '../helpers/config'
import webpack from 'webpack-stream';
import createWebpackConfig from 'magento2-theme-blank-sass-webpack';

const getThemeAliases = function(theme) {
  return (theme.aliases || []).filter(function(alias) {
    return typeof alias === 'string';
  })
}

export default async function(name, file) {
  const theme = themes[name]
  const srcBase = path.join(tempPath, theme.dest)
  const stylesDir = theme.stylesDir ? theme.stylesDir : 'styles'
  const dest = []
  const disableMaps = env.disableMaps || false
  const production = env.prod || false
  const postcssConfig = []
  const disableSuffix = theme.disableSuffix || false
  const browserslist = configLoader('browserslist.json')

  if (theme.postcss) {
    theme.postcss.forEach(el => {
      postcssConfig.push(eval(el))
    })
  }
  else {
    postcssConfig.push(autoprefixer({ overrideBrowserslist: browserslist }))
  }

  function adjustDestinationDirectory(file) {
    if (file.extname === '.css') {
      file.dirname = path.join(file.dirname, 'css');
      console.log(file);
    }
    else {
      file.dirname = file.dirname.replace('/' + stylesDir, '')
    }
    return file
  }

  theme.locale.forEach(locale => {
    dest.push(path.join(projectPath, theme.dest, locale, 'css'))
  })

  const webpackConfig = await createWebpackConfig(theme, projectPath);
console.log(dest);
  const gulpTask = webpack({
    config: webpackConfig
  })
    //.pipe(rename(adjustDestinationDirectory))
    .pipe(multiDest(dest))
    .pipe(logger({
      display   : 'name',
      beforeEach: 'Theme: ' + name + ' ',
      afterEach : ' Compiled!'
    }));

  /*if (browserSyncInstances) {
    Object.keys(browserSyncInstances).forEach(instanceKey => {
      const instance = browserSyncInstances[instanceKey]

      gulpTask.pipe(instance.stream())
    })
  }*/

  return gulpTask
}
