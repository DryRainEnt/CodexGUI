import pytest
from fastapi import status

@pytest.mark.asyncio
async def test_create_project(test_client, temp_project_dir):
    """
    Test creating a new project
    """
    project_data = {
        "name": "Test Project",
        "path": temp_project_dir,
        "description": "A test project"
    }
    
    response = test_client.post(
        "/api/projects",
        json=project_data
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == project_data["name"]
    assert data["path"] == project_data["path"]
    assert data["description"] == project_data["description"]
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

@pytest.mark.asyncio
async def test_get_projects(test_client, temp_project_dir):
    """
    Test getting all projects
    """
    # First create a project
    project_data = {
        "name": "Test Project",
        "path": temp_project_dir,
        "description": "A test project"
    }
    
    create_response = test_client.post(
        "/api/projects",
        json=project_data
    )
    
    # Then get all projects
    response = test_client.get("/api/projects")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check if the created project is in the list
    project_ids = [project["id"] for project in data]
    created_id = create_response.json()["id"]
    assert created_id in project_ids

@pytest.mark.asyncio
async def test_get_project(test_client, temp_project_dir):
    """
    Test getting a specific project
    """
    # First create a project
    project_data = {
        "name": "Test Project",
        "path": temp_project_dir,
        "description": "A test project"
    }
    
    create_response = test_client.post(
        "/api/projects",
        json=project_data
    )
    project_id = create_response.json()["id"]
    
    # Then get the project
    response = test_client.get(f"/api/projects/{project_id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == project_id
    assert data["name"] == project_data["name"]
    assert data["path"] == project_data["path"]
    assert data["description"] == project_data["description"]

@pytest.mark.asyncio
async def test_update_project(test_client, temp_project_dir):
    """
    Test updating a project
    """
    # First create a project
    project_data = {
        "name": "Test Project",
        "path": temp_project_dir,
        "description": "A test project"
    }
    
    create_response = test_client.post(
        "/api/projects",
        json=project_data
    )
    project_id = create_response.json()["id"]
    
    # Then update the project
    update_data = {
        "name": "Updated Project",
        "description": "An updated test project",
        "is_favorite": True
    }
    
    response = test_client.put(
        f"/api/projects/{project_id}",
        json=update_data
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == project_id
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["is_favorite"] == update_data["is_favorite"]
    assert data["path"] == project_data["path"]  # Path should not change

@pytest.mark.asyncio
async def test_delete_project(test_client, temp_project_dir):
    """
    Test deleting a project
    """
    # First create a project
    project_data = {
        "name": "Test Project",
        "path": temp_project_dir,
        "description": "A test project"
    }
    
    create_response = test_client.post(
        "/api/projects",
        json=project_data
    )
    project_id = create_response.json()["id"]
    
    # Then delete the project
    response = test_client.delete(f"/api/projects/{project_id}")
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Try to get the deleted project
    get_response = test_client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
