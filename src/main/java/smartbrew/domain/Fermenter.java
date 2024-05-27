package smartbrew.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Fermenter {
    private long fermenterId;
    private int fermentorVolume;
    private FermentationStatus status;
    private String fermentorLine;

    // Getters, Setters, and Constructors

    public Fermenter(int fermentorVolume, String fermentorLine) {
        this.fermentorVolume = fermentorVolume;
        this.fermentorLine = fermentorLine;
        this.status = FermentationStatus.WAITING;
    }


    public void startFermentation() {
        this.status = FermentationStatus.ACTIVE;
    }

    public void completeFermentation() {
        this.status = FermentationStatus.COMPLETED;
    }

    // Other domain-specific methods
}

