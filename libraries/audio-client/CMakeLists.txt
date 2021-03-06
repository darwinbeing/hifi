set(TARGET_NAME audio-client)

# use setup_hifi_library macro to setup our project and link appropriate Qt modules
setup_hifi_library(Network Multimedia)

link_hifi_libraries(audio)

# append audio includes to our list of includes to bubble
list(APPEND ${TARGET_NAME}_DEPENDENCY_INCLUDES "${HIFI_LIBRARY_DIR}/audio/src")

# have CMake grab Gverb from git and then set up linking and directory include
add_dependency_external_project(gverb)

find_package(Gverb REQUIRED)

target_link_libraries(${TARGET_NAME} ${GVERB_LIBRARIES})
target_include_directories(${TARGET_NAME} PRIVATE ${GVERB_INCLUDE_DIRS})

# we use libsoxr for resampling
find_package(Soxr REQUIRED)
target_link_libraries(${TARGET_NAME} ${SOXR_LIBRARIES})
include_directories(SYSTEM ${SOXR_INCLUDE_DIRS})

if (APPLE)
  find_library(CoreAudio CoreAudio)
  find_library(CoreFoundation CoreFoundation)
  target_link_libraries(${TARGET_NAME} ${CoreAudio} ${CoreFoundation})
endif ()

# call macro to include our dependency includes and bubble them up via a property on our target
include_dependency_includes()