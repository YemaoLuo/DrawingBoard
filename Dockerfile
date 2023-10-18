FROM openjdk:17
EXPOSE 12345
COPY DrawingBoard.jar /app/DrawingBoard.jar
WORKDIR /app
CMD ["nohup", "java", "-jar", "DrawingBoard.jar", "&"]