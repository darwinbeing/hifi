set(EXTERNAL_NAME gverb)

if (ANDROID)
  set(ANDROID_CMAKE_ARGS "-DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLCHAIN_FILE}" "-DANDROID_NATIVE_API_LEVEL=19")
endif ()

include(ExternalProject)
ExternalProject_Add(
  ${EXTERNAL_NAME}
  PREFIX ${EXTERNAL_NAME}
  URL http://hifi-public.s3.amazonaws.com/dependencies/gverb-master.zip
  CMAKE_ARGS ${ANDROID_CMAKE_ARGS} -DCMAKE_INSTALL_PREFIX:PATH=<INSTALL_DIR>
  LOG_DOWNLOAD ON
)

ExternalProject_Get_Property(${EXTERNAL_NAME} INSTALL_DIR)

string(TOUPPER ${EXTERNAL_NAME} EXTERNAL_NAME_UPPER)
set(${EXTERNAL_NAME_UPPER}_INCLUDE_DIRS ${INSTALL_DIR}/include CACHE TYPE STRING)

if (WIN32) 
  set(${EXTERNAL_NAME_UPPER}_LIBRARIES ${INSTALL_DIR}/lib/gverb.lib CACHE TYPE STRING)
else ()
  set(${EXTERNAL_NAME_UPPER}_LIBRARIES ${INSTALL_DIR}/lib/libgverb.a CACHE TYPE STRING)
endif ()