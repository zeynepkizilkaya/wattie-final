package com.i2i.wattie.home.controller;

import com.i2i.wattie.home.dto.ConsumptionTrendResponse;
import com.i2i.wattie.home.dto.HomeRegistrationRequest;
import com.i2i.wattie.home.dto.HomeResponse;
import com.i2i.wattie.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.i2i.wattie.home.dto.HomeStatusResponse;

import java.util.List;

@RestController
@RequestMapping("/api/homes")
@RequiredArgsConstructor
@Tag(name = "Home Management")
public class HomeController {

    private final HomeService homeService;

    @PostMapping
    @Operation(summary = "Register a new home with its appliances")
    public ResponseEntity<HomeResponse> registerHome(@Valid @RequestBody HomeRegistrationRequest request) {
        HomeResponse response = homeService.registerHome(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping
    @Operation(summary = "Get list of all registered homes")
    public ResponseEntity<List<com.i2i.wattie.home.entity.Home>> getAllHomes() {
        return ResponseEntity.ok(homeService.getAllHomes());
    }

    @GetMapping("/{homeId}/status")
    @Operation(summary = "Get live home status from in-memory state")
    public ResponseEntity<HomeStatusResponse> getStatus(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getHomeStatus(homeId));
    }

    @GetMapping("/{homeId}/appliances")
    @Operation(summary = "Get list of all appliances in a home")
    public ResponseEntity<List<com.i2i.wattie.home.entity.Appliance>> getAppliances(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getHomeAppliances(homeId));
    }

    @PostMapping("/{homeId}/appliances")
    @Operation(summary = "Add a new appliance to an existing home")
    public ResponseEntity<com.i2i.wattie.home.entity.Appliance> addAppliance(
            @PathVariable Long homeId,
            @Valid @RequestBody com.i2i.wattie.home.dto.ApplianceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(homeService.addApplianceToHome(homeId, request));
    }

    @GetMapping("/{homeId}/events")
    @Operation(summary = "Get all event logs and AI recommendations for a home")
    public ResponseEntity<List<com.i2i.wattie.home.entity.EventLog>> getEvents(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getHomeEvents(homeId));
    }

    @GetMapping("/{homeId}/trend")
    @Operation(summary = "Get historical daily consumption trend for a home")
    public ResponseEntity<List<ConsumptionTrendResponse>> getTrend(@PathVariable Long homeId) {
        return ResponseEntity.ok(homeService.getConsumptionTrend(homeId));
    }
}