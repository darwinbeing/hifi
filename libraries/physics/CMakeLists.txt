set(TARGET_NAME physics)

# use setup_hifi_library macro to setup our project and link appropriate Qt modules
setup_hifi_library()

add_dependency_external_project(glm)
find_package(GLM REQUIRED)
target_include_directories(${TARGET_NAME} PUBLIC ${GLM_INCLUDE_DIRS})

include_bullet()
if (BULLET_FOUND)
     target_link_libraries(${TARGET_NAME} ${BULLET_LIBRARIES})
endif (BULLET_FOUND)

link_hifi_libraries(shared fbx entities)
include_hifi_library_headers(fbx)

# call macro to include our dependency includes and bubble them up via a property on our target
include_dependency_includes()
