package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import smartbrew.dto.RawMaterialDTO;
import smartbrew.service.RawMaterialReceiptService;

import java.util.List;

@RestController
@RequestMapping("/repp") // 엔드포인트 변경
public class RawMaterialReceiptController {

    private final RawMaterialReceiptService rawMaterialReceiptService;
    private static final Logger logger = LoggerFactory.getLogger(RawMaterialReceiptController.class);

    @Autowired
    public RawMaterialReceiptController(RawMaterialReceiptService rawMaterialReceiptService) {
        this.rawMaterialReceiptService = rawMaterialReceiptService;
    }

    @GetMapping("/info")
    public ResponseEntity<List<RawMaterialDTO>> getAllRawMaterialDTOs() {
        try {
            List<RawMaterialDTO> materials = rawMaterialReceiptService.getAllRawMaterialDTOs();
            return new ResponseEntity<>(materials, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving materials: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}