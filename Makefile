DEPS = \
  gulp gulp-riot gulp-useref gulp-if gulp-uglify gulp-minify-html gulp-debug gulp-purifycss\
  gulp-preprocess del typescript jade\

build-deps:
	npm install $(DEPS) --save
build:
	gulp
clean:
	rm -rf ./dist/