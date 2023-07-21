
import assert from 'assert';
import HttpStatus from 'http-status-codes';
import { PostPayload } from './PostPayload';

const LOCALHOST_BASE_URL = 'http://localhost:8789';
const IMAGE_AREA_SIZE = 200;

export class Client {
    // Represents and contains the operations that a client can perform.

    // output area for printing
    private readonly consoleArea: HTMLElement;
    // input area for user images
    private readonly inputImageArea: HTMLInputElement;
    // area for displaying user images
    private readonly imageArea: HTMLCanvasElement;
    // area for inputing fname
    private readonly fnameArea: HTMLInputElement;
    // area for inputing caption
    private readonly captionArea: HTMLInputElement;
    // submission button
    private readonly submitButton: HTMLInputElement;


    public constructor(
        consoleAreaName: string,
        imageInputAreaName: string,
        imageAreaName: string,
        fnameAreaName: string,
        captionAreaName: string,
        submitButtonName: string,
        private readonly baseUrl: string = LOCALHOST_BASE_URL
    ) {

        this.consoleArea = document.getElementById(consoleAreaName) ?? assert.fail('missing console area');
        this.inputImageArea = document.getElementById(imageInputAreaName) as HTMLInputElement ?? assert.fail('missing image input area')
        this.imageArea = document.getElementById(imageAreaName) as HTMLCanvasElement?? assert.fail('missing image area');
        this.fnameArea = document.getElementById(fnameAreaName) as HTMLInputElement ?? assert.fail('missing fname area');
        this.captionArea = document.getElementById(captionAreaName) as HTMLInputElement ?? assert.fail('missing caption area');
        this.submitButton = document.getElementById(submitButtonName) as HTMLInputElement?? assert.fail('missing submit button')
        
        this.checkRep();

        this.inputImageArea.onchange = this.displayPreviewImage.bind(this);
        this.submitButton.addEventListener('click', this.submitForm.bind(this));
    }

    private checkRep(): void {
        return;
    }

    public displayPreviewImage(): void {
        const fileList: FileList = this.inputImageArea.files ?? assert.fail("Failed to get image.");
        const imageFile: File = fileList[0] ?? assert.fail("Failed to get image.");
        
        const previewImage: HTMLImageElement = new Image();
        previewImage.onload = () => {
            const canvas: HTMLCanvasElement = this.imageArea;
            if (canvas.width !== IMAGE_AREA_SIZE || canvas.height !== IMAGE_AREA_SIZE) {
                canvas.width = IMAGE_AREA_SIZE;
                canvas.height = IMAGE_AREA_SIZE;
            }
            const context: CanvasRenderingContext2D = canvas.getContext('2d') ?? assert.fail("Failed to get context.");
            context.drawImage(this.resizeImageSquare(previewImage, IMAGE_AREA_SIZE), 0, 0);
        }

        previewImage.src = URL.createObjectURL(imageFile);
        this.consoleArea.innerText = `Successfully recognized imagefile: ${imageFile.name}`;
    }

    public async submitForm(): Promise<void> {
        const payload: PostPayload = this.getPayload();

        const response = await fetch(`${this.baseUrl}/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        console.log(response.body);

        this.resetPage(response);
    }

    private resetPage(response: Response): void {
        switch (response.status) {
            case (HttpStatus.ACCEPTED): {
                this.consoleArea.innerText = "Your submission has been accepted successfully.";
                this.inputImageArea.value = "";
                this.imageArea.getContext('2d')?.clearRect(0, 0, this.imageArea.width, this.imageArea.height);
                this.fnameArea.value = "";
                this.captionArea.value = "";             
                return;
            }
            default: {
                this.consoleArea.innerText = "Sorry, something went wrong. Please try again!";
                return;
            }
        }
    }

    private getPayload(): PostPayload {
        return {
            imageCanvas: this.imageArea.toDataURL(),
            name: this.fnameArea.value,
            caption: this.captionArea.value
        }
    }

    /**
     * Creates a resized and croped version of an image onto a new canvas of a square shape.
     * 
     * If the input image is not square, the longer dimension will be trimmed off. 
     * 
     * @param image input image to resize
     * @param newWidth the new width
     * @param newHeight the new height
     * @returns a canvas containing the 
     */
    private resizeImageSquare(image: HTMLImageElement, newSideLength: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = newSideLength;
        canvas.height = newSideLength;
      
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d') ?? assert.fail("Failed to get context.");
      
        const sourceWidth = image.width;
        const sourceHeight = image.height;
        const shorterDimension = Math.min(sourceWidth, sourceHeight);
      
        // Calculate the offset to crop the image and maintain the center
        const offsetX = (sourceWidth - shorterDimension) / 2;
        const offsetY = (sourceHeight - shorterDimension) / 2;
      
        ctx.drawImage(image, offsetX, offsetY, shorterDimension, shorterDimension, 0, 0, newSideLength, newSideLength);
        return canvas;
      }
}


/**
 * Set up the page.
 */
async function main(): Promise<void> {
    const client = new Client("consoleArea", "inputImageArea", "imageArea", "fnameArea", "captionArea", "submitButton");
}

void main();
