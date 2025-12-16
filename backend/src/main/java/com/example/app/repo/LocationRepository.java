package com.example.app.repo;

import com.example.app.model.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {
    
    List<Location> findByIsActiveTrue();
    
    // Note: For production, consider using PostGIS extension for PostgreSQL
    // for efficient geospatial queries. For now, we'll filter in service layer.
}
