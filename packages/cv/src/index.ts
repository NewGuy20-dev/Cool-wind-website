export interface ImageDataLike {
	data: Uint8ClampedArray | Buffer;
	width: number;
	height: number;
}

export type DetectionAlgorithm = 'pixel' | 'fuzzy' | 'edge' | 'ocr' | 'dom';

export interface LogoTemplate {
	name: string;
	format: 'svg' | 'png' | 'jpg';
	buffer: Buffer;
}

export interface DetectionOptions {
	roi?: { x: number; y: number; width: number; height: number };
	confidenceThreshold?: number;
	allowedColorDelta?: number;
	variations?: string[];
}

export interface DetectionOutcome {
	algorithm: DetectionAlgorithm;
	confidence: number;
	coordinates?: { x: number; y: number; width: number; height: number };
	colorDelta?: number;
	variation?: string;
	failureReason?: string;
}

export interface CvAdapter {
	detectLogo(image: ImageDataLike, templates: LogoTemplate[], options?: DetectionOptions): Promise<DetectionOutcome[]>;
}

export class NoopCvAdapter implements CvAdapter {
	async detectLogo(): Promise<DetectionOutcome[]> {
		return [ { algorithm: 'dom', confidence: 0, failureReason: 'No CV library available' } ];
	}
}

export default { NoopCvAdapter };