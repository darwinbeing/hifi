set(TARGET_NAME assignment-client)

setup_hifi_project(Core Gui Network Script Widgets)

add_dependency_external_project(glm)
find_package(GLM REQUIRED)
target_include_directories(${TARGET_NAME} PRIVATE ${GLM_INCLUDE_DIRS})

# link in the shared libraries
link_hifi_libraries( 
  audio avatars octree environment gpu model fbx entities metavoxels 
  networking animation shared script-engine embedded-webserver
  physics
)

if (UNIX)
  target_link_libraries(${TARGET_NAME} ${CMAKE_DL_LIBS})
endif (UNIX)

include_dependency_includes()
